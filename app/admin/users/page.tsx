'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/use-auth'

interface User {
  id: string
  username: string
  role: 'user' | 'admin'
  created_at: string
  novels_count?: number
  comments_count?: number
}

export default function UserManagementPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'admin'>('all')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])

  useEffect(() => {
    if (user?.role === 'admin') {
      loadUsers()
    }
  }, [user])

  const loadUsers = async () => {
    try {
      // 这里应该调用获取所有用户的API
      // 暂时使用模拟数据
      const mockUsers: User[] = [
        {
          id: '1',
          username: '管理员',
          role: 'admin',
          created_at: new Date().toISOString(),
          novels_count: 5,
          comments_count: 20
        },
        {
          id: '2',
          username: '小明同学',
          role: 'user',
          created_at: new Date().toISOString(),
          novels_count: 3,
          comments_count: 15
        },
        {
          id: '3',
          username: '小作家',
          role: 'user',
          created_at: new Date().toISOString(),
          novels_count: 2,
          comments_count: 8
        },
        {
          id: '4',
          username: '故事大王',
          role: 'user',
          created_at: new Date().toISOString(),
          novels_count: 1,
          comments_count: 5
        }
      ]
      setUsers(mockUsers)
    } catch (error) {
      console.error('加载用户数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user => {
    // 搜索过滤
    if (searchTerm && !user.username.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }
    
    // 角色过滤
    if (roleFilter !== 'all' && user.role !== roleFilter) {
      return false
    }
    
    return true
  })

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id))
    }
  }

  const handleChangeRole = async (userId: string, newRole: 'user' | 'admin') => {
    try {
      // 这里应该调用更新用户角色的API
      alert(`已将用户角色修改为：${newRole === 'admin' ? '管理员' : '普通用户'}`)
      
      // 更新本地状态
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ))
    } catch (error) {
      console.error('修改用户角色失败:', error)
    }
  }

  const handleDeleteUsers = async () => {
    if (selectedUsers.length === 0) return
    
    if (!confirm(`确定要删除选中的 ${selectedUsers.length} 个用户吗？此操作不可恢复。`)) {
      return
    }

    try {
      // 这里应该调用批量删除用户的API
      alert(`已删除 ${selectedUsers.length} 个用户`)
      
      // 更新本地状态
      setUsers(users.filter(user => !selectedUsers.includes(user.id)))
      setSelectedUsers([])
    } catch (error) {
      console.error('删除用户失败:', error)
    }
  }

  // 检查管理员权限
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">权限不足</h2>
          <p className="text-gray-600 mb-6">您需要管理员权限才能访问此页面</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-gray-600">正在加载用户数据...</div>
      </div>
    )
  }

  return (
    <div>
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">用户管理</h1>
        <p className="text-gray-600">管理平台注册用户</p>
      </div>

      {/* 操作栏 */}
      <div className="bg-white rounded-xl p-6 mb-8 shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* 搜索和过滤 */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜索用户名..."
                className="w-full sm:w-64 px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute left-3 top-2.5 text-gray-400">🔍</div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setRoleFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  roleFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                全部
              </button>
              <button
                onClick={() => setRoleFilter('user')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  roleFilter === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                普通用户
              </button>
              <button
                onClick={() => setRoleFilter('admin')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  roleFilter === 'admin'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                管理员
              </button>
            </div>
          </div>

          {/* 批量操作 */}
          <div className="flex items-center gap-4">
            <span className="text-gray-600">
              已选中 <span className="font-semibold text-blue-600">{selectedUsers.length}</span> 个用户
            </span>
            {selectedUsers.length > 0 && (
              <button
                onClick={handleDeleteUsers}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                删除选中
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 用户统计 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mr-4">
              👥
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{users.length}</div>
              <div className="text-sm text-gray-600">总用户数</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600 mr-4">
              👑
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {users.filter(u => u.role === 'admin').length}
              </div>
              <div className="text-sm text-gray-600">管理员</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 mr-4">
              📝
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {users.reduce((sum, user) => sum + (user.novels_count || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">总作品数</div>
            </div>
          </div>
        </div>
      </div>

      {/* 用户列表 */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">用户名</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">角色</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">作品数</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">评论数</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">注册时间</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((userItem) => (
                  <tr key={userItem.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(userItem.id)}
                        onChange={() => handleSelectUser(userItem.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium text-sm mr-3">
                          {userItem.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-800">{userItem.username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        userItem.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {userItem.role === 'admin' ? '管理员' : '普通用户'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {userItem.novels_count || 0}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {userItem.comments_count || 0}
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">
                      {new Date(userItem.created_at).toLocaleDateString('zh-CN')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {userItem.role === 'user' ? (
                          <button
                            onClick={() => handleChangeRole(userItem.id, 'admin')}
                            className="px-3 py-1 bg-purple-100 text-purple-700 rounded text-sm font-medium hover:bg-purple-200 transition-colors"
                          >
                            设为管理员
                          </button>
                        ) : (
                          <button
                            onClick={() => handleChangeRole(userItem.id, 'user')}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm font-medium hover:bg-gray-200 transition-colors"
                          >
                            取消管理员
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (confirm(`确定要删除用户 "${userItem.username}" 吗？此操作不可恢复。`)) {
                              // 这里应该调用删除用户的API
                              alert(`已删除用户：${userItem.username}`)
                            }
                          }}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm font-medium hover:bg-red-200 transition-colors"
                        >
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="text-3xl mb-3">👤</div>
                    <p className="text-gray-600">未找到符合条件的用户</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 管理提示 */}
      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-yellow-800 mb-3">⚠️ 用户管理注意事项</h3>
        <ul className="space-y-2 text-yellow-700">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>删除用户将同时删除该用户的所有作品和评论，请谨慎操作</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>设为管理员后，用户将拥有后台管理权限</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>建议至少保留一个管理员账号</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>处理用户举报时，请先与用户沟通核实</span>
          </li>
        </ul>
      </div>

      {/* 快速操作 */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
          <div className="text-2xl mb-2">📊</div>
          <div className="font-medium text-gray-700">导出用户数据</div>
          <div className="text-sm text-gray-500 mt-1">导出为Excel文件</div>
        </div>
        
        <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
          <div className="text-2xl mb-2">📧</div>
          <div className="font-medium text-gray-700">发送站内通知</div>
          <div className="text-sm text-gray-500 mt-1">向用户发送消息</div>
        </div>
        
        <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
          <div className="text-2xl mb-2">🔍</div>
          <div className="font-medium text-gray-700">查看操作日志</div>
          <div className="text-sm text-gray-500 mt-1">审计管理操作</div>
        </div>
      </div>
    </div>
  )
}