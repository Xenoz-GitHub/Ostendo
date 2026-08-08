import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Ostendo — Student portfolios',
    short_name: 'Ostendo',
    description:
      'Build a professional portfolio, claim your personal URL, and share your work with the world.',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#f7f7f6',
    theme_color: '#0f766e',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512-maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
