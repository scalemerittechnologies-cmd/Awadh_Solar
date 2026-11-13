export const GOOGLE_BUSINESS_PROFILE_URL = 'https://share.google/z8kJEbxPZtqX1ZeKd'

export function googleMapsDirectionsUrl(address: string) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`
}
