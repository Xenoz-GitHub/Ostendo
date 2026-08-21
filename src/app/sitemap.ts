import type { MetadataRoute } from 'next'
import { db } from '@/lib/db'
import { appBaseUrl } from '@/lib/site'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = await appBaseUrl()

  // Get all published portfolios
  const publishedUsers = await db.user.findMany({
    where: {
      username: { not: null },
      portfolio: { published: true },
    },
    select: {
      username: true,
      portfolio: {
        select: { updatedAt: true },
      },
    },
  })

  const portfolioUrls: MetadataRoute.Sitemap = publishedUsers
    .filter((user) => user.username)
    .map((user) => ({
      url: `${base}/${user.username}`,
      lastModified: user.portfolio?.updatedAt ?? new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

  return [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${base}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${base}/signup`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    ...portfolioUrls,
  ]
}
