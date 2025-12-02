/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // =============================================================================
  // Performance Optimization - Hyperscale Production
  // =============================================================================
  swcMinify: true,
  compress: true,
  poweredByHeader: false,

  // Output configuration for standalone deployment
  output: 'standalone',

  // =============================================================================
  // Image Optimization with CDN
  // =============================================================================
  images: {
    domains: [
      'firebasestorage.googleapis.com',
      'codeb-web.firebasestorage.app',
      'lh3.googleusercontent.com',
      'cdn.codeb.app',
      'images.codeb.app'
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000, // 1 year
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    loader: 'default',
    // Use CDN for image optimization in production
    ...(process.env.NODE_ENV === 'production' && {
      loader: 'custom',
      loaderFile: './src/lib/image-loader.ts',
    }),
  },

  // =============================================================================
  // CDN & Edge Caching Headers
  // =============================================================================
  async headers() {
    return [
      // Static assets - Long cache with immutable
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'CDN-Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Images - Long cache
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'CDN-Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Fonts - Long cache
      {
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // API health endpoints - Short cache
      {
        source: '/api/health/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=60, stale-while-revalidate=300',
          },
        ],
      },
      // API endpoints - No cache (dynamic)
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          },
          {
            key: 'CDN-Cache-Control',
            value: 'no-store',
          },
        ],
      },
      // All other pages - Stale while revalidate
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'unsafe-none',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
        ],
      },
    ]
  },
  webpack: (config, { isServer }) => {
    // Firebase 관련 설정
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        'child_process': false,
      }
    }

    // undici 모듈 문제 해결
    config.resolve.alias = {
      ...config.resolve.alias,
      'undici': false,
    }

    return config
  },
}

module.exports = nextConfig
