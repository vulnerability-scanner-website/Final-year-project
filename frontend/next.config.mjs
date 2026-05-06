/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'xubohuah.github.io',
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
