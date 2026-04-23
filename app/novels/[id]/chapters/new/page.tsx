'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/app/auth-context'

interface Novel {
  id: string
  title: string
  author_id: string
}

export default function AddChapterPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const novelId = params.id as string
  
  const [novel, setNovel] = useState<Novel | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [chapterCount, setChapterCount] = useState(0)

  useEffect(() => {
    if (novelId) {
      loadNovelInfo()
    }
  }, [novelId])

  const loadNovelInfo = async () => {
    try {
      // 加载小说信息
      const novelRes = await fetch(`/api/novels/${novelId}`)
      if (novelRes.ok) {
        const novelData = await novelRes.json()
        if (novelData.success) {
          setNovel(novelData.novel)
          
          // 检查用户权限
          if (user?.id !== novelData.novel.author_id) {
            router.push(`/novels/${novelId}`)
            return
          }
          
          // 加载现有章节数量
          setChapterCount(novelData.novel.chapters?.length || 0)
          
          // 自动生成默认标题
          if (!formData.title) {
            setFormData(prev => ({
              ...prev,
              title: `第${(novelData.novel.chapters?.length || 0) + 1}章`
            }))
          }
        }
      }
    } catch (error) {
      console.error('加载小说信息失败:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    if (!formData.title.trim()) {
      setError('请输入章节标题')
      return
    }
    
    if (!formData.content.trim()) {
      setError('请输入章节内容')
      return
    }
    
    setLoading(true)

    try {
      const response = await fetch('/api/chapters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          novel_id: novelId,
          title: formData.title,
          content: formData.content,
          chapter_number: chapterCount + 1
        })
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setSuccess('章节添加成功！')
          setFormData({ title: '', content: '' })
          
          setTimeout(() => {
            router.push(`/novels/${novelId}`)
          }, 1500)
        } else {
          setError(result.error || '添加章节失败')
        }
      } else {
        setError('添加章节失败')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '添加失败')
    } finally {
      setLoading(false)
    }
  }

  if (!novel) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-gray-600">加载中...</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* 页面标题 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">续写新章节</h1>
            <p className="text-gray-600">
              为小说《{novel.title}》添加第 {chapterCount + 1} 章
            </p>
          </div>
          
          <Link
            href={`/novels/${novelId}`}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            返回小说
          </Link>
        </div>
      </div>

      {/* 创作指南 */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
        <h3 className="text-lg font-semibold text-green-800 mb-3">📝 续写提示</h3>
        <ul className="space-y-2 text-green-700">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>章节标题要简洁明了，反映本章主要内容</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>保持与前文情节的连贯性</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>适当设置悬念，吸引读者继续阅读</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>对话要使用引号，并另起一行</span>
          </li>
        </ul>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 章节信息 */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">章节信息</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                章节标题 *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="例如：新的冒险开始"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                建议标题能体现本章的核心内容
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                章节内容 *
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                placeholder="开始创作本章内容..."
                rows={16}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-serif leading-relaxed"
                required
              />
              <div className="mt-2 flex justify-between text-sm text-gray-500">
                <span>支持分段和换行，建议每段不要太长</span>
                <span>{formData.content.length} 字符</span>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-700 mb-2">💡 创作建议</h4>
              <div className="text-sm text-blue-600 space-y-1">
                <p>• 开头可以承接上一章的结尾，或者开启新的场景</p>
                <p>• 适当描写环境、人物表情和动作，让故事更生动</p>
                <p>• 对话要自然，符合人物性格</p>
                <p>• 结尾可以设置悬念，让读者期待下一章</p>
              </div>
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
            {success} 3秒后自动跳转...
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-200">
          <Link
            href={`/novels/${novelId}`}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            取消返回
          </Link>
          
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => {
                // 保存草稿功能
                alert('草稿保存功能开发中...')
              }}
              className="px-6 py-3 bg-yellow-600 text-white rounded-lg font-medium hover:bg-yellow-700 transition-colors"
            >
              保存草稿
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '添加中...' : '添加章节'}
            </button>
          </div>
        </div>
      </form>

      {/* 章节示例 */}
      <div className="mt-12 bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">📖 章节示例</h3>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h4 className="font-medium text-gray-700 mb-3">标题示例：</h4>
          <ul className="text-gray-600 space-y-1 mb-6">
            <li>• 《神秘森林的入口》</li>
            <li>• 《与新朋友的相遇》</li>
            <li>• 《解开古老的谜题》</li>
            <li>• 《惊险的逃脱》</li>
          </ul>
          
          <h4 className="font-medium text-gray-700 mb-3">内容开头示例：</h4>
          <div className="text-gray-600 font-serif leading-relaxed border-l-4 border-blue-200 pl-4 py-2">
            <p>清晨的阳光透过树叶的缝隙洒在地上，形成斑驳的光影。小明深吸了一口森林中清新的空气，心中充满了期待和一丝紧张。</p>
            <p>"我们真的要进去吗？"小红小声问道，紧紧抓住小明的衣袖。</p>
            <p>小明点点头，目光坚定地看着前方那片更加茂密的树林。"当然，我们已经走了这么远，不能现在放弃。"</p>
          </div>
        </div>
      </div>

      {/* 快速导航 */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href={`/novels/${novelId}`}
          className="bg-white p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all text-center"
        >
          <div className="text-2xl mb-2">📖</div>
          <div className="font-medium text-gray-700">返回阅读</div>
        </Link>
        
        <Link
          href={`/novels/${novelId}/chapters`}
          className="bg-white p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all text-center"
        >
          <div className="text-2xl mb-2">📚</div>
          <div className="font-medium text-gray-700">管理章节</div>
        </Link>
        
        <Link
          href={`/novels/${novelId}/edit`}
          className="bg-white p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all text-center"
        >
          <div className="text-2xl mb-2">✏️</div>
          <div className="font-medium text-gray-700">编辑小说</div>
        </Link>
      </div>
    </div>
  )
}