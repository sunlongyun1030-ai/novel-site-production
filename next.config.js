/** @type {import('next').NextConfig} */
const nextConfig = {
  // 基本配置
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
  
  // Webpack配置 - 添加路径别名
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // 客户端构建时添加别名
      config.resolve.alias = {
        ...config.resolve.alias,
        '@': __dirname,
      }
    }
    return config
  },
}

module.exports = nextConfig