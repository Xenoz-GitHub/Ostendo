/**
 * Sanitization utilities for user-generated content.
 * Prevents XSS attacks by escaping HTML entities and dangerous characters.
 */

/**
 * Escapes HTML entities in a string to prevent XSS.
 * Use this for any user-generated content displayed as text.
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  }
  return text.replace(/[&<>"'/]/g, (char) => map[char] || char)
}

/**
 * Sanitizes a URL to prevent javascript: and data: URIs.
 * Returns null if the URL is potentially dangerous.
 */
export function sanitizeUrl(url: string | null | undefined): string | null {
  if (!url) return null

  const trimmed = url.trim().toLowerCase()

  // Block dangerous protocols
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:']
  if (dangerousProtocols.some((protocol) => trimmed.startsWith(protocol))) {
    return null
  }

  // Allow relative URLs, http, https, mailto
  if (
    trimmed.startsWith('/') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('mailto:')
  ) {
    return url.trim()
  }

  // If no protocol, assume https://
  if (!trimmed.includes('://') && !trimmed.startsWith('/')) {
    return `https://${url.trim()}`
  }

  return url.trim()
}

/**
 * Strips all HTML tags from a string, leaving only text content.
 * Useful for generating plain text summaries or meta descriptions.
 */
export function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim()
}

/**
 * Truncates text to a maximum length, adding ellipsis if needed.
 * Ensures the truncation happens at word boundaries.
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text

  const truncated = text.slice(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')

  if (lastSpace > maxLength * 0.8) {
    return truncated.slice(0, lastSpace) + '…'
  }

  return truncated + '…'
}

/**
 * Validates and sanitizes user input for safe storage and display.
 * This is a general-purpose sanitizer for text fields.
 */
export function sanitizeTextInput(input: string | null | undefined): string {
  if (!input) return ''

  return input
    .trim()
    .replace(/\r\n/g, '\n') // Normalize line endings
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n') // Limit consecutive newlines
    .slice(0, 10000) // Hard limit to prevent abuse
}
