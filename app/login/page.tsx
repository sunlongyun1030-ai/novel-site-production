'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/app/use-auth'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const success = await login(formData.username, formData.password)
      if (success) {
        // 登录成功后跳转到作品库
        router.push('/novels')
        router.refresh() // 刷新页面以更新导航栏状态
      } else {
        setError('用户名或密码错误')
      }
    } catch (err) {
      setError('登录失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12">
      <div className="w-full max-w-md">
        {/* 登录卡片 */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          {/* Logo和标题 */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <span className="text-2xl text-blue-600">📚</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">欢迎回来</h1>
            <p className="text-gray-600 mt-2">登录您的账号继续创作</p>
          </div>

          {/* 登录表单 */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                用户名
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                placeholder="请输入用户名"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <p className="mt-1 text-sm text-gray-500">支持中文用户名</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                密码
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="请输入密码"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <p className="mt-1 text-sm text-gray-500">至少6个字符</p>
            </div>

            {/* 错误提示 */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* 登录按钮 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '登录中...' : '登录'}
            </button>
          </form>

          {/* 注册链接 */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              还没有账号？{' '}
              <Link
                href="/register"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                立即注册
              </Link>
            </p>
          </div>

          {/* 快速导航 */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-center text-gray-600 mb-4">或者</p>
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/"
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors text-center"
              >
                返回首页
              </Link>
              <Link
                href="/novels"
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition-colors text-center"
              >
                浏览作品
              </Link>
            </div>
          </div>
        </div>

        {/* 平台特色 */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
            <div className="text-2xl mb-2">🎨</div>
            <div className="font-medium text-gray-700">简约设计</div>
            <div className="text-sm text-gray-500 mt-1">适合小学生使用</div>
          </div>
          
          <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
            <div className="text-2xl mb-2">📚</div>
            <div className="font-medium text-gray-700">免费创作</div>
            <div className="text-sm text-gray-500 mt-1">零成本开始写作</div>
          </div>
          
          <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
            <div className="text-2xl mb-2">💬</div>
            <div className="font-medium text-gray-700">互动交流</div>
            <div className="text-sm text-gray-500 mt-1">读者作者互动</div>
          </div>
        </div>

        {/* 登录提示 */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">💡 登录后您可以：</h3>
          <ul className="space-y-2 text-blue-700">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>创作和管理自己的小说作品</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>为喜欢的小说发表评论</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>保存草稿，随时继续创作</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>查看个人创作统计</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}