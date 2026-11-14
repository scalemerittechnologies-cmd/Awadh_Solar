/** Netlify's Next.js function can see an internal request URL. Its URL variable
 * contains the public site origin, which is the one sent by browsers. */
export function hasAllowedOrigin(request: Request, requireOrigin = true): boolean {
  const origin = request.headers.get('origin')
  if (!origin) return !requireOrigin
  try {
    const candidate = new URL(origin).origin
    const publicUrl = process.env.URL
    const expected = publicUrl ? new URL(publicUrl).origin : new URL(request.url).origin
    return candidate === expected
  } catch {
    return false
  }
}
