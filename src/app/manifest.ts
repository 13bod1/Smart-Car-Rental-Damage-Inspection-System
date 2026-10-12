import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'AutoRent AI — Smart Car Rental',
    short_name: 'AutoRent',
    description: 'AI-powered car rental platform with automatic damage assessment and vehicle valuation.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0c14',
    theme_color: '#0a0c14',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
