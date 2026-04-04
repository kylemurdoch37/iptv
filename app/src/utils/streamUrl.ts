/**
 * In production (Vercel), route stream URLs through our proxy API.
 * This bypasses self-signed SSL certs and CORS restrictions on stream servers.
 * In development, streams are used directly.
 */
export function proxiedUrl(url: string): string {
  if (!url) return url
  if (import.meta.env.PROD) {
    return `/api/proxy?url=${encodeURIComponent(url)}`
  }
  return url
}
