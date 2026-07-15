import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    // turbopack configuration
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'serpapi.com' },
      { protocol: 'https', hostname: 'encrypted-tbn0.gstatic.com' },
      { protocol: 'https', hostname: 'images.pexels.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'assets.lummi.ai' },
      { protocol: 'https', hostname: 'hebbkx1anhila5yf.public.blob.vercel-storage.com' }
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  webpack: (config, { isServer, dev, nextRuntime, webpack }) => {
    if (nextRuntime === 'edge') {
      config.plugins.push(
        new webpack.DefinePlugin({
          'process.version': JSON.stringify(process.version),
        })
      );
    }

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        punycode: false,
      }

      // Optimize bundle splitting for large dependencies
      if (!dev) {
        config.optimization = {
          ...config.optimization,
          splitChunks: {
            chunks: 'all',
            maxInitialRequests: 25,
            minSize: 20000,
            cacheGroups: {
              default: false,
              vendors: false,
              // Split PDF.js into separate chunk
              pdfjs: {
                name: 'pdfjs',
                chunks: 'all',
                test: /[\\/]node_modules[\\/](pdfjs-dist|pdf-parse|pdf-lib)[\\/]/,
                priority: 40,
                enforce: true,
              },
              // Split Three.js into separate chunk
              three: {
                name: 'three',
                chunks: 'all',
                test: /[\\/]node_modules[\\/]three[\\/]/,
                priority: 35,
                enforce: true,
              },
              // Split React Three Fiber into separate chunk
              reactThreeFiber: {
                name: 'react-three-fiber',
                chunks: 'all',
                test: /[\\/]node_modules[\\/]@react-three[\\/]/,
                priority: 30,
                enforce: true,
              },
              // Framework chunk
              framework: {
                name: 'framework',
                chunks: 'all',
                test: /[\\/]node_modules[\\/](react|react-dom|next)[\\/]/,
                priority: 45,
                enforce: true,
              },
              // Commons chunk
              commons: {
                name: 'commons',
                minChunks: 2,
                priority: 20,
              },
            },
          },
        }
      }
    }
    return config
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Performance optimizations
  poweredByHeader: false,
  compress: true,
  generateEtags: true,
  productionBrowserSourceMaps: false,
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
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://www.googletagmanager.com https://www.google-analytics.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https: http:",
              "connect-src 'self' https://*.supabase.co https://openrouter.ai https://api.openai.com https://api.cloudinary.com https://api.stripe.com https://api.logo.dev https://generativelanguage.googleapis.com https://www.google-analytics.com",
              "frame-src 'self' https://js.stripe.com",
              "frame-ancestors 'none'",
            ].join('; '),
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

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer(nextConfig);
