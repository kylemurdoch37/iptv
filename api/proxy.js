const https = require('https')
const http = require('http')
const { URL } = require('url')

// Ignore self-signed / invalid SSL certs on stream servers
const httpsAgent = new https.Agent({ rejectUnauthorized: false })

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')

  if (req.method === 'OPTIONS') return res.status(200).end()

  const { url } = req.query
  if (!url) return res.status(400).send('url parameter required')

  let targetUrl
  try {
    targetUrl = decodeURIComponent(url)
    new URL(targetUrl)
  } catch {
    return res.status(400).send('Invalid URL')
  }

  const parsed = new URL(targetUrl)
  const isHttps = parsed.protocol === 'https:'
  const lib = isHttps ? https : http
  const reqOptions = isHttps ? { agent: httpsAgent } : {}

  const proxyReq = lib.get(targetUrl, reqOptions, (proxyRes) => {
    const ct = proxyRes.headers['content-type'] || ''
    const isM3U8 =
      ct.includes('mpegurl') ||
      targetUrl.includes('.m3u8') ||
      targetUrl.includes('.m3u')

    if (isM3U8) {
      let data = ''
      proxyRes.setEncoding('utf8')
      proxyRes.on('data', (chunk) => { data += chunk })
      proxyRes.on('end', () => {
        const rewritten = rewriteM3U8(data, targetUrl)
        res.setHeader('Content-Type', 'application/vnd.apple.mpegurl')
        res.setHeader('Cache-Control', 'no-cache')
        res.send(rewritten)
      })
    } else {
      // Binary content (TS segments, AAC audio, etc) — pipe straight through
      res.setHeader('Content-Type', ct || 'application/octet-stream')
      if (proxyRes.headers['content-length']) {
        res.setHeader('Content-Length', proxyRes.headers['content-length'])
      }
      proxyRes.pipe(res)
    }
  })

  proxyReq.on('error', (err) => {
    console.error('Proxy error:', err.message)
    if (!res.headersSent) res.status(502).send('Stream unavailable')
  })

  proxyReq.setTimeout(20000, () => {
    proxyReq.destroy()
    if (!res.headersSent) res.status(504).send('Timeout')
  })
}

function rewriteM3U8(content, baseUrl) {
  const base = new URL(baseUrl)
  const basePath = base.pathname.substring(0, base.pathname.lastIndexOf('/') + 1)

  return content
    .split('\n')
    .map((line) => {
      const trimmed = line.trim()
      if (!trimmed) return line

      // Rewrite URI="..." inside tags like #EXT-X-KEY, #EXT-X-MAP
      const tagWithUri = trimmed.match(/^(#[^:]+:.*URI=")([^"]+)(".*)/i)
      if (tagWithUri) {
        const abs = resolveUrl(tagWithUri[2], base, basePath)
        return `${tagWithUri[1]}/api/proxy?url=${encodeURIComponent(abs)}${tagWithUri[3]}`
      }

      // Leave other directives alone
      if (trimmed.startsWith('#')) return line

      // Rewrite segment URLs
      const abs = resolveUrl(trimmed, base, basePath)
      return `/api/proxy?url=${encodeURIComponent(abs)}`
    })
    .join('\n')
}

function resolveUrl(url, base, basePath) {
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  if (url.startsWith('/')) return `${base.origin}${url}`
  return `${base.origin}${basePath}${url}`
}
