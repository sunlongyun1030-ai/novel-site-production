'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import Link from 'next/link'
import { useAuth } from '@/app/use-auth'
import { useRouter, useSearchParams } from 'next/navigation'

interface Novel {
  id: string
  title: string
  description: string | null
  author_username: string
  created_at: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  total_pages: number
  has_next: boolean
  has_prev: boolean
}

function NovelsContent() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [novels, setNovels] = useState<Novel[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 1,
    has_next: false,
    has_prev: false
  })
  const [limit, setLimit] = useState(10)

  // 构建查询参数
  const buildQueryString = useCallback((page: number, search: string, limit: number) => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (page > 1) params.set('page', page.toString())
    if (limit !== 10) params.set('limit', limit.toString())
    return params.toString()
  }, [])

  // 加载小说数据
  const loadNovels = useCallback(async (page: number, search: string, limit: number) => {
    try {
      setLoading(true)
      const queryString = buildQueryString(page, search, limit)
      const url = `/api/novels${queryString ? `?${queryString}` : ''}`
      
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setNovels(data.novels || [])
          setPagination(data.pagination || {
            page: 1,
            limit: 10,
            total: 0,
            total_pages: 1,
            has_next: false,
            has_prev: false
          })
          
          // 更新URL（不刷新页面）
          const newQueryString = buildQueryString(data.pagination.page, search, limit)
          const newUrl = `/novels${newQueryString ? `?${newQueryString}` : ''}`
          router.replace(newUrl, { scroll: false })
        }
      }
    } catch (error) {
      console.error('加载小说失败:', error)
    } finally {
      setLoading(false)
    }
  }, [buildQueryString, router])

  // 初始加载和参数变化时重新加载
  useEffect(() => {
    const page = parseInt(searchParams.get('page') || '1')
    const search = searchParams.get('search') || ''
    const limitParam = parseInt(searchParams.get('limit') || '10')
    
    setSearchTerm(search)
    setLimit(limitParam)
    loadNovels(page, search, limitParam)
  }, [searchParams, loadNovels])

  // 处理搜索
  const handleSearch = () => {
    loadNovels(1, searchTerm, limit)
  }

  // 处理搜索输入变化（回车搜索）
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  // 处理页码变化
  const handlePageChange = (newPage: number) => {
    loadNovels(newPage, searchTerm, limit)
  }

  // 处理每页数量变化
  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit)
    loadNovels(1, searchTerm, newLimit)
  }

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading && novels.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-gray-600">正在加载作品库...</div>
      </div>
    )
  }

  return (
    <div>
      {/* 页面标题和操作 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">作品库</h1>
        <p className="text-gray-600">浏览所有已发布的小说作品</p>
      </div>

      {/* 搜索和筛选区域 */}
      <div className="bg-white rounded-xl p-6 mb-8 shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="搜索小说标题、作者或描述..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                🔍
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              搜索
            </button>
            
            <select
              value={limit}
              onChange={(e) => handleLimitChange(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="5">每页5条</option>
              <option value="10">每页10条</option>
              <option value="20">每页20条</option>
              <option value="50">每页50条</option>
            </select>
          </div>
        </div>
        
        {/* 搜索状态提示 */}
        {searchTerm && (
          <div className="mt-4 text-sm text-gray-600">
            搜索关键词: <span className="font-medium">{searchTerm}</span>
            <button
              onClick={() => {
                setSearchTerm('')
                loadNovels(1, '', limit)
              }}
              className="ml-2 text-blue-600 hover:text-blue-800"
            >
              清除
            </button>
          </div>
        )}
      </div>

      {/* 作品列表 */}
      {novels.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200">
          <div className="text-5xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {searchTerm ? '没有找到相关作品' : '作品库空空如也'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm 
              ? '尝试使用其他关键词搜索，或者浏览所有作品'
              : '成为第一个发布作品的作者吧！'
            }
          </p>
          {searchTerm ? (
            <button
              onClick={() => {
                setSearchTerm('')
                loadNovels(1, '', limit)
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              浏览所有作品
            </button>
          ) : user ? (
            <Link
              href="/novels/new"
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              创作新小说
            </Link>
          ) : (
            <Link
              href="/login"
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              登录后创作
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* 作品网格 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {novels.map((novel) => (
              <Link
                key={novel.id}
                href={`/novels/${novel.id}`}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all duration-200"
              >
                <h3 className="text-xl font-semibold text-gray-800 mb-2 line-clamp-2">
                  {novel.title}
                </h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                  {novel.description || '暂无描述'}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>作者: {novel.author_username}</span>
                  <span>{formatDate(novel.created_at)}</span>
                </div>
              </Link>
            ))}
          </div>

          {/* 分页控件 */}
          {pagination.total_pages > 1 && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* 分页信息 */}
                <div className="text-gray-600 text-sm">
                  显示第 {(pagination.page - 1) * pagination.limit + 1} -{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} 条，
                  共 {pagination.total} 条作品
                </div>

                {/* 分页按钮 */}
                <div className="flex items-center gap-2">
                  {/* 上一页 */}
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={!pagination.has_prev}
                    className={`px-3 py-1 rounded-lg border ${
                      pagination.has_prev
                        ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        : 'border-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    上一页
                  </button>

                  {/* 页码按钮 */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
                      let pageNum
                      if (pagination.total_pages <= 5) {
                        pageNum = i + 1
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1
                      } else if (pagination.page >= pagination.total_pages - 2) {
                        pageNum = pagination.total_pages - 4 + i
                      } else {
                        pageNum = pagination.page - 2 + i
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-8 h-8 rounded-lg ${
                            pageNum === pagination.page
                              ? 'bg-blue-600 text-white'
                              : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                  </div>

                  {/* 下一页 */}
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={!pagination.has_next}
                    className={`px-3 py-1 rounded-lg border ${
                      pagination.has_next
                        ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        : 'border-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    下一页
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default function NovelsPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center">加载中...</div>}>
      <NovelsContent />
    </Suspense>
  )
}