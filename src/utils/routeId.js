// Base64url encode/decode for project IDs in URLs
export function encodeId(id) {
  return btoa(String(id)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

export function decodeId(hash) {
  if (!hash) return null
  // Support plain numeric IDs (old links)
  if (/^\d+$/.test(hash)) return Number(hash)
  try {
    return Number(atob(hash.replace(/-/g, '+').replace(/_/g, '/')))
  } catch {
    return null
  }
}
