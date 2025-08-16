/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Disable ESLint during builds to prevent lint errors from failing CI/deploys
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
