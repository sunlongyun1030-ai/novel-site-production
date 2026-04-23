/** @type {import('next').NextConfig} */
const nextConfig = {
  // 基本配置
  reactStrictMode: false,
  
  // 完全禁用TypeScript - 使用experimental配置
  experimental: {
    disablePostcssPresetEnv: true,
  },
  
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
  
  // Webpack配置 - 明确的路径别名
  webpack: (config, { isServer }) => {
    // 添加路径别名（服务器端和客户端都需要）
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': __dirname,
      '@/app': __dirname + '/app',
      '@/components': __dirname + '/components',
      '@/hooks': __dirname + '/hooks',
      '@/lib': __dirname + '/lib',
    }
    
    return config
  },
  
  // 禁用TypeScript自动检测
  onDemandEntries: {
    // 增加时间避免TypeScript检测
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
}

module.exports = nextConfig