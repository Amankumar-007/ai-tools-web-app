import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: [
      'serpapi.com',
      'encrypted-tbn0.gstatic.com',
      'images.pexels.com',
      'images.unsplash.com',
      'assets.lummi.ai'
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days
  },
  webpack: (config, { isServer, dev }) => {
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
            cacheGroups: {
              default: false,
              vendors: false,
              // Split PDF.js into separate chunk
              pdfjs: {
                name: 'pdfjs',
                chunks: 'all',
                test: /[\\/]node_modules[\\/](pdfjs-dist|pdf-parse|pdf-lib)[\\/]/,
                priority: 30,
                enforce: true,
              },
              // Split Three.js into separate chunk
              three: {
                name: 'three',
                chunks: 'all',
                test: /[\\/]node_modules[\\/]three[\\/]/,
                priority: 25,
                enforce: true,
              },
              // Split React Three Fiber into separate chunk
              reactThreeFiber: {
                name: 'react-three-fiber',
                chunks: 'all',
                test: /[\\/]node_modules[\\/]@react-three[\\/]/,
                priority: 20,
                enforce: true,
              },
              // Split other large vendor libraries
              vendor: {
                name: 'vendor',
                chunks: 'all',
                test: /[\\/]node_modules[\\/]/,
                priority: 10,
                minChunks: 2,
                enforce: true,
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
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https: http:",
              "connect-src 'self' https://*.supabase.co https://openrouter.ai https://api.openai.com https://api.cloudinary.com https://api.stripe.com https://api.logo.dev https://generativelanguage.googleapis.com",
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

module.exports = withBundleAnalyzer(nextConfig)

export default nextConfig;
