import type { MetadataRoute } from 'next'
import { appBaseUrl } from '@/lib/site'

export default async function robots(): Promise<MetadataRoute.Robots> {
  const base = await appBaseUrl()

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/dashboard/', '/onboarding/', '/login', '/signup'],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  }
}
