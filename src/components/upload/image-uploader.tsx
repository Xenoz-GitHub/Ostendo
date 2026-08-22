'use client'

import { useRef, useState } from 'react'
import { ImagePlus, LoaderCircle, Link2, X } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Uploads an image to ImgBB through /api/upload and writes the resulting URL
 * into a hidden form field so server-action forms pick it up automatically.
 * Manual URL paste is still supported.
 */
export function ImageUploader({
  fieldName,
  defaultValue,
  round = false,
  hint,
}: {
  fieldName: string
  defaultValue?: string | null
  round?: boolean
  hint?: string
}) {
  const [url, setUrl] = useState(defaultValue ?? '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showUrl, setShowUrl] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setError(null)
    if (!file.type.startsWith('image/')) {
      setError('That file is not an image.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image is too large. Keep it under 5 MB.')
      return
    }
    setBusy(true)
    try {
      const body = new FormData()
      body.append('file', file)
      const response = await fetch('/api/upload', { method: 'POST', body })
      
      // Handle network and server errors with specific messages
      if (!response.ok) {
        const payload = await response.json().catch(() => null) as { error?: string } | null
        
        if (response.status === 400) {
          setError(payload?.error ?? 'Invalid file. Please check the file type and try again.')
        } else if (response.status === 413) {
          setError('Image is too large. Keep it under 5 MB.')
        } else if (response.status === 500) {
          setError('Server error. Image upload is not configured properly.')
        } else if (response.status === 502 || response.status === 503) {
          setError('Image service is temporarily unavailable. Please try again later.')
        } else if (response.status === 429) {
          setError('Too many upload attempts. Please wait a moment and try again.')
        } else {
          setError(payload?.error ?? 'Upload failed. Please try again.')
        }
        return
      }
      
      const payload = await response.json().catch(() => null) as { ok?: boolean; url?: string; error?: string } | null
      if (!payload?.ok || !payload.url) {
        setError(payload?.error ?? 'Upload failed. No image URL returned.')
        return
      }
      setUrl(payload.url)
    } catch (error) {
      // Network errors (no internet, timeout, etc.)
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setError('Network error. Please check your internet connection and try again.')
      } else {
        setError('Upload failed. Please check your connection and try again.')
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-3">
      <input type="hidden" name={fieldName} value={url} />

      <div className="flex items-center gap-4">
        <div
          className={cn(
            'flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-surface-muted',
            round && 'rounded-full'
          )}
        >
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="" className={cn('size-full object-cover', round && 'rounded-full')} />
          ) : (
            <span className="text-xs font-medium text-muted-foreground">No image</span>
          )}
        </div>

        <div className="space-y-1.5">
          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-border-strong bg-surface px-3 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted disabled:opacity-50"
          >
            {busy ? (
              <LoaderCircle className="size-4 animate-spin" aria-hidden />
            ) : (
              <ImagePlus className="size-4" aria-hidden />
            )}
            {busy ? 'Uploading…' : url ? 'Replace image' : 'Upload image'}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) handleFile(file)
              event.target.value = ''
            }}
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowUrl((value) => !value)}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <Link2 className="size-3.5" aria-hidden /> {showUrl ? 'Hide' : 'Paste a URL instead'}
            </button>
            {url && (
              <button
                type="button"
                onClick={() => setUrl('')}
                className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-destructive"
              >
                <X className="size-3.5" aria-hidden /> Remove
              </button>
            )}
          </div>
        </div>
      </div>

      {showUrl && (
        <input
          type="url"
          placeholder="https://…"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          className="h-9 w-full rounded-md border border-border-strong bg-surface px-2 text-sm text-foreground"
        />
      )}

      {error && <p role="alert" aria-live="polite" className="text-sm text-destructive">{error}</p>}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}
