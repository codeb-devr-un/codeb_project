// =============================================================================
// CDN Image Loader - Hyperscale Production
// Integrates with CloudFront, Cloudflare, or custom CDN
// =============================================================================

interface ImageLoaderParams {
  src: string
  width: number
  quality?: number
}

const CDN_URL = process.env.NEXT_PUBLIC_CDN_URL || 'https://cdn.codeb.app'

export default function cdnImageLoader({ src, width, quality = 75 }: ImageLoaderParams): string {
  // If already a full URL, use CDN proxy
  if (src.startsWith('http://') || src.startsWith('https://')) {
    // Encode the source URL for CDN proxy
    const encodedSrc = encodeURIComponent(src)
    return `${CDN_URL}/image?url=${encodedSrc}&w=${width}&q=${quality}`
  }

  // Remove leading slash for local images
  const path = src.startsWith('/') ? src.slice(1) : src

  // CloudFront/Cloudflare Image Resizing compatible URL
  return `${CDN_URL}/${path}?w=${width}&q=${quality}&f=auto`
}

// =============================================================================
// Image Optimization Utilities
// =============================================================================

/**
 * Get optimized image URL with blur placeholder
 */
export function getOptimizedImageUrl(
  src: string,
  options: {
    width?: number
    height?: number
    quality?: number
    format?: 'webp' | 'avif' | 'auto'
  } = {}
): string {
  const { width = 1200, quality = 75, format = 'auto' } = options

  if (!src) return ''

  const params = new URLSearchParams({
    w: width.toString(),
    q: quality.toString(),
    f: format,
  })

  if (src.startsWith('http')) {
    return `${CDN_URL}/image?url=${encodeURIComponent(src)}&${params.toString()}`
  }

  const path = src.startsWith('/') ? src.slice(1) : src
  return `${CDN_URL}/${path}?${params.toString()}`
}

/**
 * Generate blur data URL for placeholder
 */
export function getBlurDataUrl(width: number = 8, height: number = 8): string {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <filter id="blur">
        <feGaussianBlur stdDeviation="2" />
      </filter>
      <rect width="100%" height="100%" fill="#f3f4f6" filter="url(#blur)" />
    </svg>
  `
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
}

/**
 * Preload critical images
 */
export function preloadImage(src: string, width: number = 1200): void {
  if (typeof window === 'undefined') return

  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = 'image'
  link.href = cdnImageLoader({ src, width })
  document.head.appendChild(link)
}

/**
 * Get srcSet for responsive images
 */
export function getSrcSet(
  src: string,
  widths: number[] = [640, 750, 828, 1080, 1200, 1920],
  quality: number = 75
): string {
  return widths
    .map(w => `${cdnImageLoader({ src, width: w, quality })} ${w}w`)
    .join(', ')
}
