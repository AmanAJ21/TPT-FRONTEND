import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  // Enhanced mobile performance optimizations
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [320, 420, 768, 1024, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Compression for better mobile loading
  compress: true,
  // PWA-ready headers for mobile
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // Mobile viewport optimization
          {
            key: 'viewport',
            value: 'width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes',
          },
        ],
      },
    ]
  },
}

export default nextConfig
  