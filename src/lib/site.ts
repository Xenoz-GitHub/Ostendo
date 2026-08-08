import 'server-only'
import { headers } from 'next/headers'

/**
 * The site's public base URL for the current request. Prefers the proxy
 * headers (Vercel sets x-forwarded-proto/host), then APP_URL, then localhost.
 */
export async function appBaseUrl(): Promise<string> {
  const headerList = await headers()
  const host = headerList.get('x-forwarded-host') ?? headerList.get('host')
  if (host) {
    const proto = headerList.get('x-forwarded-proto')?.split(',')[0]?.trim() ?? 'http'
    return `${proto}://${host}`
  }
  return process.env.APP_URL ?? 'http://localhost:3000'
}

/** The public URL of a student's portfolio. */
export async function portfolioUrl(username: string): Promise<string> {
  return `${await appBaseUrl()}/${username}`
}
