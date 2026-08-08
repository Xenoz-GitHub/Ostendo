import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth'
import { ImgbbUploadError, uploadImageToImgbb } from '@/lib/imgbb'

export const runtime = 'nodejs'
export const maxDuration = 30

const MAX_BYTES = 5 * 1024 * 1024

const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
}

const MAGIC: [string, number[]][] = [
  ['image/jpeg', [0xff, 0xd8, 0xff]],
  ['image/png', [0x89, 0x50, 0x4e, 0x47]],
  ['image/gif', [0x47, 0x49, 0x46, 0x38]],
]

function sniffMime(bytes: Uint8Array): string | null {
  for (const [mime, magic] of MAGIC) {
    if (magic.every((byte, index) => bytes[index] === byte)) return mime
  }
  if (bytes.length >= 12) {
    const riff = [0x52, 0x49, 0x46, 0x46].every((byte, index) => bytes[index] === byte)
    const webp = [0x57, 0x45, 0x42, 0x50].every((byte, index) => bytes[8 + index] === byte)
    if (riff && webp) return 'image/webp'
  }
  if (bytes.length >= 12) {
    const ftyp = [0x66, 0x74, 0x79, 0x70].every((byte, index) => bytes[4 + index] === byte)
    if (ftyp) return 'image/avif'
  }
  return null
}

export async function POST(request: NextRequest) {
  await requireUser()

  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid upload request.' }, { status: 400 })
  }

  const file = form.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: 'No image file provided.' }, { status: 400 })
  }

  const type = ALLOWED_TYPES[file.type]
  if (!type) {
    return NextResponse.json({ ok: false, error: 'Only JPG, PNG, WebP, GIF, and AVIF images are allowed.' }, { status: 400 })
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ ok: false, error: 'Image is too large. Keep it under 5 MB.' }, { status: 413 })
  }

  const bytes = new Uint8Array(await file.arrayBuffer())
  const sniffed = sniffMime(bytes)
  if (sniffed && sniffed !== file.type) {
    return NextResponse.json({ ok: false, error: 'The image content does not match its file type.' }, { status: 400 })
  }
  if (!sniffed && file.type === 'image/avif') {
    // AVIF has no simple magic check; the declared type is trusted.
  }

  try {
    const base64 = Buffer.from(bytes).toString('base64')
    const result = await uploadImageToImgbb(base64, file.name || 'image')
    return NextResponse.json({ ok: true, url: result.url, deleteUrl: result.deleteUrl })
  } catch (error) {
    console.error('upload failed', error)
    if (error instanceof ImgbbUploadError && error.code === 'NOT_CONFIGURED') {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Upload failed. Please try again.' },
      { status: 502 }
    )
  }
}
