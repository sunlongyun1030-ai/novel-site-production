/** @type {import('next').NextConfig} */
const nextConfig = {
  // 绝对最小配置
  reactStrictMode: false,
  
  // 禁用所有检查
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // 静态导出（最兼容）
  output: 'export',
  
  // 禁用图片优化
  images: {
    unoptimized: true,
  },
  
  // 禁用所有实验性功能
  experimental: {},
}

module.exports = nextConfig