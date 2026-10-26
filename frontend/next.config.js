/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["localhost:3000", "127.0.0.1:3000", "192.168.31.252"],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:8000/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
