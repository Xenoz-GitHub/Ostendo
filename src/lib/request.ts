import 'server-only'
import { headers } from 'next/headers'

/**
 * Extract client IP address from request headers.
 * Checks common proxy headers in order of precedence.
 */
export async function getClientIp(): Promise<string> {
  const headerList = await headers()
  
  // Check X-Forwarded-For header (most common with proxies/load balancers)
  const forwarded = headerList.get('x-forwarded-for')
  if (forwarded) {
    // X-Forwarded-For can contain multiple IPs, use the first (client)
    const clientIp = forwarded.split(',')[0]?.trim()
    if (clientIp) return clientIp
  }
  
  // Check X-Real-IP header (used by some proxies)
  const realIp = headerList.get('x-real-ip')
  if (realIp) return realIp
  
  // Check CF-Connecting-IP (Cloudflare)
  const cfIp = headerList.get('cf-connecting-ip')
  if (cfIp) return cfIp
  
  // Check True-Client-IP (Akamai, Cloudflare Enterprise)
  const trueClientIp = headerList.get('true-client-ip')
  if (trueClientIp) return trueClientIp
  
  // Fallback for cases where we can't determine the IP
  return 'unknown'
}

/**
 * Create a fingerprint for anonymous rate limiting.
 * Combines IP with User-Agent for better uniqueness.
 */
export async function getClientFingerprint(): Promise<string> {
  const ip = await getClientIp()
  const headerList = await headers()
  const userAgent = headerList.get('user-agent') || 'unknown'
  
  // Create a simple fingerprint (in production, consider hashing this)
  return `${ip}:${userAgent.substring(0, 50)}`
}
