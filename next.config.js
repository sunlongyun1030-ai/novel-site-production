/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['wrangler'],
  },
  // Cloudflare Pages适配配置
  output: 'standalone',
  // 启用API路由
  rewrites: async () => {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8788/api/:path*',
      },
    ]
  },
  // 优化Cloudflare Pages部署
  compress: true,
  generateEtags: true,
  poweredByHeader: false,
  reactStrictMode: true,
}

module.exports = nextConfig