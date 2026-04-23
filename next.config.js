/** @type {import('next').NextConfig} */
const nextConfig = {
  // 基本配置
  reactStrictMode: true,
  swcMinify: true,
  
  // 暂时移除standalone模式
  // output: 'standalone',
  
  // 暂时移除重写规则
  // rewrites: async () => {
  //   return [
  //     {
  //       source: '/api/:path*',
  //       destination: '/api/:path*',
  //     },
  //   ]
  // },
}

module.exports = nextConfig