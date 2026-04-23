'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'

export default function Navbar() {
  const { user, loading } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-blue-600">
              简阅小说
            </Link>
            <span className="ml-2 text-sm text-gray-500 hidden md:inline">
              小学生创作平台
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-gray-700 hover:text-blue-600">
              首页
            </Link>
            <Link href="/novels" className="text-gray-700 hover:text-blue-600">
              作品库
            </Link>
            {user && (
              <>
                <Link href="/my-novels" className="text-gray-700 hover:text-blue-600">
                  我的作品
                </Link>
                <Link href="/novels/new" className="text-gray-700 hover:text-blue-600">
                  创作新小说
                </Link>
              </>
            )}
            {user?.role === 'admin' && (
              <Link href="/admin" className="text-gray-700 hover:text-blue-600">
                后台管理
              </Link>
            )}
          </div>

          {/* Auth Section */}
          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="text-gray-500">加载中...</div>
            ) : user ? (
              <div className="flex items-center space-x-3">
                <span className="text-gray-700">
                  欢迎，{user.username}
                  {user.role === 'admin' && (
                    <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      管理员
                    </span>
                  )}
                </span>
                <Link
                  href="/api/auth/logout"
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  退出
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/login"
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  登录
                </Link>
                <Link
                  href="/register"
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  注册
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-3">
              <Link href="/" className="text-gray-700 hover:text-blue-600 px-4 py-2">
                首页
              </Link>
              <Link href="/novels" className="text-gray-700 hover:text-blue-600 px-4 py-2">
                作品库
              </Link>
              {user && (
                <>
                  <Link href="/my-novels" className="text-gray-700 hover:text-blue-600 px-4 py-2">
                    我的作品
                  </Link>
                  <Link href="/novels/new" className="text-gray-700 hover:text-blue-600 px-4 py-2">
                    创作新小说
                  </Link>
                </>
              )}
              {user?.role === 'admin' && (
                <Link href="/admin" className="text-gray-700 hover:text-blue-600 px-4 py-2">
                  后台管理
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}