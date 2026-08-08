import { ImageResponse } from 'next/og'
import { getPublicPortfolioData } from '@/lib/portfolio'
import { mix } from '@/lib/design'
import { initials } from '@/lib/utils'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MUTED_W = 0.55

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params
  const data = await getPublicPortfolioData(username)
  if (!data) return new Response('Not found', { status: 404 })

  const { primary, background, text, accent } = data.design.palette
  const muted = mix(background, text, MUTED_W)
  const headline = data.headline ?? 'Student portfolio'
  const school = [data.university, data.major].filter(Boolean).join(' · ')

  try {
    const image = new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            width: '100%',
            height: '100%',
            backgroundColor: background,
            color: text,
            fontFamily: 'sans-serif',
            position: 'relative',
          }}
        >
          <div style={{ position: 'absolute', left: 0, top: 0, width: 16, height: '100%', backgroundColor: primary }} />
          <div
            style={{
              display: 'flex',
              flex: 1,
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '72px 96px 64px 112px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: primary }} />
              <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: 4, color: muted }}>OSTENDO</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 72, fontWeight: 800, letterSpacing: -2, lineHeight: 1.05 }}>
                {data.name}
              </div>
              <div style={{ marginTop: 16, fontSize: 34, color: muted, lineHeight: 1.25 }}>
                {headline}
              </div>
              <div style={{ marginTop: 28, width: 72, height: 6, borderRadius: 999, backgroundColor: primary }} />
              {(data.contactEmail || school) && (
                <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 26, color: muted }}>
                  {school && <div>{school}</div>}
                  {data.contactEmail && <div>{data.contactEmail}</div>}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', paddingRight: 96 }}>
            {data.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={data.avatarUrl}
                alt=""
                width={224}
                height={224}
                style={{ borderRadius: 999, objectFit: 'cover', border: `8px solid ${accent}` }}
              />
            ) : (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 224,
                  height: 224,
                  borderRadius: 999,
                  backgroundColor: accent,
                  color: text,
                  fontSize: 84,
                  fontWeight: 800,
                }}
              >
                {initials(data.name)}
              </div>
            )}
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    )
    image.headers.set('Cache-Control', 'public, max-age=3600')
    return image
  } catch (error) {
    console.error(`OG image for /${username} failed`, error)
    return new Response('OG image unavailable', { status: 500 })
  }
}
