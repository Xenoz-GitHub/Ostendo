import 'server-only'

const IMGBB_ENDPOINT = 'https://api.imgbb.com/1/upload'
const REQUEST_TIMEOUT_MS = 15_000
/** Keys that hit a quota error are skipped for this long. */
const LIMIT_COOLDOWN_MS = 15 * 60_000
/** Keys that fail with any other error are skipped for this long. */
const ERROR_COOLDOWN_MS = 5 * 60_000

export class ImgbbUploadError extends Error {
  constructor(
    public code: 'NOT_CONFIGURED' | 'ALL_KEYS_FAILED',
    message: string
  ) {
    super(message)
  }
}

/** Every configured API key, in order, one per ImgBB account. */
function allKeys(): string[] {
  const raw = process.env.IMGBB_API_KEYS ?? process.env.IMGBB_API_KEY ?? ''
  return raw
    .split(',')
    .map((key) => key.trim())
    .filter(Boolean)
}

// Module-level key queue + health, so a limit on one key never blocks the rest.
const queue: string[] = []
const demotedUntil = new Map<string, number>()
let cursor = 0

function initQueue() {
  if (queue.length > 0) return
  const keys = allKeys()
  queue.push(...keys)
  demotedUntil.clear()
  cursor = 0
}

/** Returns the next usable key and rotates the queue (round-robin fairness). */
function nextKey(now: number): string | null {
  initQueue()
  for (let i = 0; i < queue.length; i++) {
    const index = (cursor + i) % queue.length
    const key = queue[index]
    if ((demotedUntil.get(key) ?? 0) <= now) {
      cursor = (index + 1) % queue.length
      return key
    }
  }
  // Every key is cooling down; try the next one anyway — limits may have reset.
  const key = queue[cursor]
  cursor = (cursor + 1) % queue.length
  return key ?? null
}

async function attemptUpload(
  key: string,
  base64: string,
  filename: string
): Promise<{ url: string; deleteUrl: string }> {
  const form = new FormData()
  form.append('key', key)
  form.append('image', base64)
  form.append('name', filename.replace(/\.[^.]+$/, '').slice(0, 64))

  const response = await fetch(IMGBB_ENDPOINT, {
    method: 'POST',
    body: form,
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  })
  const payload = (await response.json().catch(() => null)) as {
    data?: { url?: unknown; delete_url?: unknown }
    error?: { message?: unknown } | unknown
  } | null

  if (response.ok && payload?.data && typeof payload.data.url === 'string') {
    return {
      url: payload.data.url,
      deleteUrl: typeof payload.data.delete_url === 'string' ? payload.data.delete_url : '',
    }
  }

  const message = describeError(response.status, payload)
  if (response.status === 429 || /limit|quota|rate|exceed/i.test(message)) {
    const err = new Error(message)
    ;(err as Error & { code?: string }).code = 'LIMIT'
    throw err
  }
  throw new Error(message)
}

function describeError(status: number, payload: unknown): string {
  const message =
    payload && typeof payload === 'object' && 'error' in payload
      ? (payload as { error: unknown }).error
      : null
  const text =
    message && typeof message === 'object' && 'message' in message
      ? (message as { message: unknown }).message
      : message
  if (typeof text === 'string' && text) return text
  return `Image host responded with ${status}.`
}

/**
 * Uploads a base64 image to ImgBB. Tries each configured API key in turn,
 * skipping any key that just hit a rate limit or quota (fast fallback).
 */
export async function uploadImageToImgbb(base64: string, filename: string): Promise<{ url: string; deleteUrl: string }> {
  initQueue()
  if (queue.length === 0) {
    throw new ImgbbUploadError('NOT_CONFIGURED', 'Image hosting is not configured on this site.')
  }

  const attempts = queue.length
  let lastMessage = 'Upload failed. Please try again.'
  for (let i = 0; i < attempts; i++) {
    const key = nextKey(Date.now())
    if (!key) break
    try {
      const result = await attemptUpload(key, base64, filename)
      demotedUntil.delete(key)
      return result
    } catch (error) {
      const code = (error as Error & { code?: string }).code
      const message = (error as Error).message
      demotedUntil.set(key, Date.now() + (code === 'LIMIT' ? LIMIT_COOLDOWN_MS : ERROR_COOLDOWN_MS))
      lastMessage = message
    }
  }
  throw new ImgbbUploadError('ALL_KEYS_FAILED', lastMessage)
}
