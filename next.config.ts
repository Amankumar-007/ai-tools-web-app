import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';

/**
 * Content-Security-Policy. Notes:
 *  - Production drops 'unsafe-eval' (nothing here needs it); development keeps it for hot reload.
 *  - 'unsafe-inline' for scripts remains because Next.js/Google Analytics emit inline scripts; a
 *    nonce-based policy would force every page to render dynamically and lose static/ISR speed.
 *    Injection risk is instead reduced at the source (HTML-escaping of model output, safe JSON-LD).
 *  - connect-src lists only hosts the *browser* talks to. AI providers (OpenRouter, OpenAI, Gemini)
 *    are called by the server only, so the browser is not allowed to reach them.
 */
function contentSecurityPolicy(): string {
  // Whatever Supabase URL is configured (a custom domain or self-hosted instance is not under *.supabase.co).
  let supabaseOrigin = '';
  try { supabaseOrigin = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || '').origin; } catch { /* not configured */ }
  const google = [
    'https://www.googletagmanager.com', 'https://*.googletagmanager.com',
    'https://www.google-analytics.com', 'https://*.google-analytics.com', 'https://*.analytics.google.com',
    'https://*.g.doubleclick.net', 'https://*.google.com', 'https://*.gstatic.com',
  ];
  const directives = [
    "default-src 'self'",
    `script-src 'self' ${isProd ? '' : "'unsafe-eval' "}'unsafe-inline' https://checkout.razorpay.com ${google.join(' ')}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com https://fonts.googleapis.com https://unpkg.com https://cdn.jsdelivr.net",
    `img-src 'self' data: blob: https:${isProd ? '' : ' http:'}`,
    `connect-src 'self' https://*.supabase.co ${supabaseOrigin} https://api.cloudinary.com https://api.razorpay.com https://lumberjack.razorpay.com https://checkout.razorpay.com https://api.logo.dev https://i.ytimg.com https://*.licdn.com https://video.twimg.com https://pbs.twimg.com ${google.join(' ')} https://stats.g.doubleclick.net https://*.doubleclick.net https://*.google.co.in https://*.vercel-storage.com`,
    "frame-src 'self' https://api.razorpay.com https://checkout.razorpay.com https://*.googletagmanager.com https://*.g.doubleclick.net https://*.doubleclick.net https://*.google.com",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ];
  if (isProd) directives.push('upgrade-insecure-requests');
  return directives.join('; ');
}

const nextConfig: NextConfig = {
  distDir: process.env.NODE_ENV === 'development' ? '.next-dev' : '.next',
  turbopack: {
    root: process.cwd(),
  },
  outputFileTracingRoot: process.cwd(),
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'serpapi.com' },
      { protocol: 'https', hostname: 'encrypted-tbn0.gstatic.com' },
      { protocol: 'https', hostname: 'images.pexels.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'assets.lummi.ai' },
      { protocol: 'https', hostname: 'hebbkx1anhila5yf.public.blob.vercel-storage.com' },
      // Logo & favicon services
      { protocol: 'https', hostname: 'www.google.com' },
      { protocol: 'https', hostname: 'logo.clearbit.com' },
      { protocol: 'https', hostname: 'icon.horse' },
      { protocol: 'https', hostname: 't0.gstatic.com' },
      { protocol: 'https', hostname: 't1.gstatic.com' },
      { protocol: 'https', hostname: 't2.gstatic.com' },
      { protocol: 'https', hostname: 't3.gstatic.com' },
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Performance optimizations
  poweredByHeader: false,
  compress: true,
  generateEtags: true,
  // Never ship source maps: the original source is not downloadable from the browser.
  productionBrowserSourceMaps: false,
  // Strip console.log/info/debug from production bundles (errors and warnings stay).
  compiler: {
    removeConsole: isProd ? { exclude: ['error', 'warn'] } : false,
  },
  experimental: {
    // Import only the icons/components actually used from these large packages.
    optimizePackageImports: ['framer-motion', 'motion', 'sonner', 'react-icons', '@heroicons/react', 'lucide-react', 'recharts', '@xyflow/react', 'es-toolkit', '@radix-ui/react-icons'],
  },
  // SEO optimizations
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
            value: '0', // legacy auditor is disabled: it could itself introduce vulnerabilities
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(self), geolocation=(), usb=(), bluetooth=(), serial=(), magnetometer=(), gyroscope=(), accelerometer=(), browsing-topics=(), payment=(self "https://checkout.razorpay.com" "https://api.razorpay.com")',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
          {
            key: 'X-Permitted-Cross-Domain-Policies',
            value: 'none',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: contentSecurityPolicy(),
          },
        ],
      },
      {
        source: '/robots.txt',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, s-maxage=86400',
          },
        ],
      },
      {
        source: '/sitemap.xml',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, s-maxage=86400',
          },
        ],
      },
      {
        // Files in /public are not fingerprinted, so they cannot be cached forever; a week plus background refresh is safe.
        source: '/:all*(svg|jpg|jpeg|png|gif|webp|avif|ico|woff2)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=604800, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
      {
        source: '/index.html',
        destination: '/',
        permanent: true,
      },
    ]
  },
};

// `ANALYZE=true next build` writes an HTML report; add `ANALYZE_MODE=json` to get machine-readable stats instead.
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
  openAnalyzer: false,
  analyzerMode: process.env.ANALYZE_MODE === 'json' ? 'json' : 'static',
})

module.exports = withBundleAnalyzer(nextConfig);
