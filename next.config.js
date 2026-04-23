/** @type {import('next').NextConfig} */
const nextConfig = {
  // 基本配置
  reactStrictMode: true,
  swcMinify: true,
  
  // 禁用TypeScript检查（Cloudflare环境可能有问题）
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // 禁用ESLint检查
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // 重要：移除output: 'export'，使用默认构建
  // output: 'export',
  
  // 图片优化配置
  images: {
    unoptimized: true,
  },
  
  // 实验性功能（如果需要）
  experimental: {
    serverComponentsExternalPackages: ['wrangler'],
  },
}

module.exports = nextConfig