'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/app/auth-context'

export default function RegisterPage() {
  const router = useRouter()
  const { register } = useAuth()
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // 验证表单
    if (!formData.username.trim()) {
      setError('请输入用户名')
      return
    }

    if (formData.username.length < 2 || formData.username.length > 20) {
      setError('用户名长度必须在2-20个字符之间')
      return
    }

    if (!formData.password) {
      setError('请输入密码')
      return
    }

    if (formData.password.length < 6) {
      setError('密码长度至少6个字符')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }

    setLoading(true)

    try {
      const success = await register(formData.username, formData.password)
      if (success) {
        setSuccess('注册成功！正在跳转...')
        // 注册成功后跳转到作品库
        setTimeout(() => {
          router.push('/novels')
          router.refresh() // 刷新页面以更新导航栏状态
        }, 1500)
      } else {
        setError('注册失败，用户名可能已被使用')
      }
    } catch (err) {
      setError('注册失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12">
      <div className="w-full max-w-md">
        {/* 注册卡片 */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          {/* Logo和标题 */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <span className="text-2xl text-green-600">✨</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">加入简阅创作</h1>
            <p className="text-gray-600 mt-2">开启您的小说创作之旅</p>
          </div>

          {/* 注册表单 */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                用户名 *
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                placeholder="请输入用户名（支持中文）"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <p className="mt-1 text-sm text-gray-500">2-20个字符，支持中文、英文、数字</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                密码 *
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="请输入密码"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <p className="mt-1 text-sm text-gray-500">至少6个字符，建议使用字母和数字组合</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                确认密码 *
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                placeholder="请再次输入密码"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* 错误和成功提示 */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                {success}
              </div>
            )}

            {/* 注册按钮 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '注册中...' : '立即注册'}
            </button>
          </form>

          {/* 登录链接 */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              已有账号？{' '}
              <Link
                href="/login"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                立即登录
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
                先浏览作品
              </Link>
            </div>
          </div>
        </div>

        {/* 注册优势 */}
        <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">🎉 注册即享：</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg border border-green-200">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 mr-3">
                  ✓
                </div>
                <div className="font-medium text-gray-700">完全免费</div>
              </div>
              <p className="text-sm text-gray-600">零成本开始创作，无任何费用</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-blue-200">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mr-3">
                  📚
                </div>
                <div className="font-medium text-gray-700">无限创作</div>
              </div>
              <p className="text-sm text-gray-600">创作多部小说，添加无限章节</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-purple-200">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mr-3">
                  💬
                </div>
                <div className="font-medium text-gray-700">读者互动</div>
              </div>
              <p className="text-sm text-gray-600">获得读者评论，与读者交流</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-yellow-200">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 mr-3">
                  🎯
                </div>
                <div className="font-medium text-gray-700">简约易用</div>
              </div>
              <p className="text-sm text-gray-600">专为小学生设计的友好界面</p>
            </div>
          </div>
        </div>

        {/* 用户名示例 */}
        <div className="mt-8 bg-gray-50 rounded-xl p-6">
          <h4 className="font-medium text-gray-700 mb-3">👤 用户名示例：</h4>
          <div className="flex flex-wrap gap-2">
            {['小明同学', '小作家', '幻想家', '故事大王', '文学少年', '创作小能手'].map((name) => (
              <span
                key={name}
                className="px-3 py-1 bg-white border border-gray-300 rounded-full text-sm text-gray-600"
              >
                {name}
              </span>
            ))}
          </div>
          <p className="mt-3 text-sm text-gray-500">
            您可以使用中文用户名，这样其他读者更容易记住您
          </p>
        </div>
      </div>
    </div>
  )
}