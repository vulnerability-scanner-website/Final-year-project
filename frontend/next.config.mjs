/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  experimental: {
    turbo: {
      resolveAlias: {},
    },
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://security-scanner-backend:5000/api/:path*',
      },
    ];
  },
};

export default nextConfig;
