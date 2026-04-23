'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/auth-context'
import Link from 'next/link'

export default function CreateNovelPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'draft' as 'draft' | 'published'
  })
  const [chapterContent, setChapterContent] = useState('')
  const [chapterTitle, setChapterTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 检查用户是否登录
    if (!user) {
      setError('请先登录')
      return
    }
    
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      // 验证表单
      if (!formData.title.trim()) {
        throw new Error('请输入小说标题')
      }

      // 创建小说
      const novelResponse = await fetch('/api/novels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || null,
          status: formData.status,
          author_id: user.id,
          author_username: user.username
        })
      })

      if (!novelResponse.ok) {
        throw new Error('创建小说失败')
      }

      const novelResult = await novelResponse.json()
      if (!novelResult.success) {
        throw new Error(novelResult.error || '创建小说失败')
      }

      const novel = novelResult.novel

      // 如果有章节内容，创建第一章
      if (chapterContent.trim()) {
        const chapterResponse = await fetch('/api/chapters', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            novel_id: novel.id,
            title: chapterTitle || '第一章',
            content: chapterContent,
            chapter_number: 1
          })
        })

        if (!chapterResponse.ok) {
          throw new Error('创建章节失败')
        }
      }

      setSuccess('小说创建成功！')
      
      // 根据状态跳转
      setTimeout(() => {
        if (formData.status === 'published') {
          router.push(`/novels/${novel.id}`)
        } else {
          router.push('/my-novels')
        }
      }, 1500)

    } catch (err) {
      setError(err instanceof Error ? err.message : '创建失败')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">需要登录</h2>
          <p className="text-gray-600 mb-6">请登录后开始创作</p>
          <div className="flex justify-center gap-4">
            <Link
              href="/login"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              立即登录
            </Link>
            <Link
              href="/register"
              className="px-6 py-3 bg-white text-blue-600 border border-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
            >
              注册账号
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">创作新小说</h1>
        <p className="text-gray-600">开始创作您的第一部小说作品</p>
      </div>

      {/* 创作指南 */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">💡 创作提示</h3>
        <ul className="space-y-2 text-blue-700">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>为小说起一个吸引人的标题</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>简单描述故事内容，让读者了解大致情节</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>可以直接开始写第一章，也可以先保存为草稿</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>发布后其他用户就可以阅读您的作品了</span>
          </li>
        </ul>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 小说基本信息 */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">小说信息</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                小说标题 *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="请输入小说标题"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <p className="mt-1 text-sm text-gray-500">建议标题简洁明了，能体现故事主题</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                故事描述
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="简单描述您的故事内容（可选）"
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-1 text-sm text-gray-500">让读者了解故事的大致情节和主题</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                发布状态
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="status"
                    value="draft"
                    checked={formData.status === 'draft'}
                    onChange={(e) => setFormData({...formData, status: e.target.value as 'draft' | 'published'})}
                    className="mr-2"
                  />
                  <span className="text-gray-700">保存为草稿</span>
                  <span className="ml-2 text-sm text-gray-500">（稍后继续完善）</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="status"
                    value="published"
                    checked={formData.status === 'published'}
                    onChange={(e) => setFormData({...formData, status: e.target.value as 'draft' | 'published'})}
                    className="mr-2"
                  />
                  <span className="text-gray-700">直接发布</span>
                  <span className="ml-2 text-sm text-gray-500">（其他用户可立即阅读）</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* 第一章内容（可选） */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">第一章内容（可选）</h2>
            <span className="text-sm text-gray-500">可以直接开始创作，也可以稍后添加</span>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                章节标题
              </label>
              <input
                type="text"
                value={chapterTitle}
                onChange={(e) => setChapterTitle(e.target.value)}
                placeholder="例如：第一章 故事的开始"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                章节内容
              </label>
              <textarea
                value={chapterContent}
                onChange={(e) => setChapterContent(e.target.value)}
                placeholder="开始创作您的故事..."
                rows={12}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-serif leading-relaxed"
              />
              <div className="mt-2 flex justify-between text-sm text-gray-500">
                <span>支持分段和换行，建议每段不要太长</span>
                <span>{chapterContent.length} 字符</span>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-2">📝 写作建议</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 开头要吸引读者，可以设置悬念或展示精彩场景</li>
                <li>• 适当分段，让阅读更轻松</li>
                <li>• 对话要使用引号，并另起一行</li>
                <li>• 可以随时保存草稿，稍后继续完善</li>
              </ul>
            </div>
          </div>
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

        {/* 操作按钮 */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-200">
          <Link
            href="/my-novels"
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            返回我的作品
          </Link>
          
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => {
                setFormData({...formData, status: 'draft'})
                handleSubmit(new Event('submit') as any)
              }}
              disabled={loading}
              className="px-6 py-3 bg-yellow-600 text-white rounded-lg font-medium hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '保存中...' : '保存草稿'}
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '创建中...' : formData.status === 'published' ? '发布小说' : '创建小说'}
            </button>
          </div>
        </div>
      </form>

      {/* 创作示例 */}
      <div className="mt-12 bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">🎯 创作示例</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h4 className="font-medium text-gray-700 mb-2">标题示例</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 《小明的奇幻冒险》</li>
              <li>• 《校园里的秘密花园》</li>
              <li>• 《未来世界的机器人朋友》</li>
              <li>• 《恐龙时代的奇妙旅行》</li>
            </ul>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h4 className="font-medium text-gray-700 mb-2">描述示例</h4>
            <p className="text-sm text-gray-600">
              这是一个关于勇气和友谊的故事。小明在森林里发现了一个神秘的门，门后是一个充满奇幻生物的世界。他和新朋友们一起冒险，克服困难，最终学会了真正的勇气。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}