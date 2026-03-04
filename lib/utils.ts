// Generates a human-readable unique access code like: UNLK-A7X2-9QP1
export function generateAccessCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no ambiguous chars (0,O,I,1)
  const seg = () =>
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `UNLK-${seg()}-${seg()}`
}

// Hash a string (used for IP + session token storage)
export async function hashString(input: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(input)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// Format ZAR currency
export function formatZAR(cents: number): string {
  return `R${cents.toLocaleString('en-ZA')}`
}

// Get device info string from request headers
export function getDeviceInfo(userAgent: string): string {
  const ua = userAgent.toLowerCase()
  if (ua.includes('mobile')) return 'Mobile'
  if (ua.includes('tablet')) return 'Tablet'
  return 'Desktop'
}
