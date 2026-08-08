import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPublicPortfolioData } from '@/lib/portfolio'
import { appBaseUrl } from '@/lib/site'
import { TemplateRenderer } from '@/components/portfolio/templates/registry'

export const dynamic = 'force-dynamic'

export async function generateMetadata(props: PageProps<'/[username]'>): Promise<Metadata> {
  const { username } = await props.params
  const data = await getPublicPortfolioData(username)
  if (!data) {
    return { title: 'Portfolio not found — Ostendo' }
  }
  const base = await appBaseUrl()
  const title = `${data.name} — ${data.headline ?? 'Student portfolio'}`
  const description = data.bio ?? `${data.name}'s portfolio, built with Ostendo.`
  const pageUrl = `${base}/${username}`
  const ogImage = {
    url: `${base}/og/${username}`,
    width: 1200,
    height: 630,
    alt: `${data.name} — ${data.headline ?? 'Student portfolio'}`,
  }
  return {
    title,
    description,
    alternates: { canonical: pageUrl },
    openGraph: {
      title,
      description,
      type: 'profile',
      url: pageUrl,
      siteName: 'Ostendo',
      images: [ogImage],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  }
}

export default async function PublicPortfolioPage(props: PageProps<'/[username]'>) {
  const { username } = await props.params
  const data = await getPublicPortfolioData(username)
  if (!data) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: data.name,
    url: `${await appBaseUrl()}/${username}`,
    image: data.avatarUrl ?? undefined,
    jobTitle: data.headline ?? undefined,
    alumniOf: data.university ?? undefined,
    address: data.location ? { '@type': 'PostalAddress', addressLocality: data.location } : undefined,
    sameAs: data.socialLinks
      .filter((link) => link.type !== 'EMAIL' && link.url.trim().length > 0)
      .map((link) => (link.url.startsWith('http://') || link.url.startsWith('https://') ? link.url : `https://${link.url}`)),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TemplateRenderer data={data} />
    </>
  )
}
