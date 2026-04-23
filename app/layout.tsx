import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import { AuthProvider } from '@/hooks/use-auth'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '简阅小说创作平台 - 专为小学生设计',
  description: '专为5-6年级小学生设计的简约小说创作平台',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
              {children}
            </main>
            <footer className="bg-white border-t border-gray-200 py-6 mt-12">
              <div className="container mx-auto px-4 text-center text-gray-600">
                <p>© 2024 简阅小说创作平台 - 专为5-6年级小学生设计</p>
                <p className="mt-2 text-sm">简约界面 | 高对比度 | 响应式设计 | 完全免费</p>
              </div>
            </footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}