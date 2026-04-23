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
  
  // 禁用图片优化
  images: {
    unoptimized: true,
  },
  
  // 禁用所有实验性功能
  experimental: {},
  
  // 禁用字体优化（可能引起问题）
  optimizeFonts: false,
}

module.exports = nextConfig