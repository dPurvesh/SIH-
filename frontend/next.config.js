const rawBackend = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
const backendUrl = (rawBackend.includes('127.0.0.1') || rawBackend.includes('localhost') || !rawBackend)
  ? 'http://127.0.0.1:8000'
  : rawBackend.replace(/\/$/, '');

const nextConfig = {
  allowedDevOrigins: ["localhost:3000", "127.0.0.1:3000", "192.168.31.252"],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
