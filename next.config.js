/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['wrangler'],
  },
  // 启用API路由
  rewrites: async () => {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8788/api/:path*',
      },
    ]
  },
}

module.exports = nextConfig