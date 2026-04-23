import { Database, User } from './database'

export class Auth {
  constructor(private db: Database) {}

  async register(username: string, password: string): Promise<User> {
    // 验证用户名
    if (!username || username.length < 2 || username.length > 20) {
      throw new Error('用户名长度必须在2-20个字符之间')
    }
    
    // 验证密码
    if (!password || password.length < 6) {
      throw new Error('密码长度至少6个字符')
    }
    
    // 检查用户名是否已存在
    const existingUser = await this.db.getUserByUsername(username)
    if (existingUser) {
      throw new Error('用户名已存在')
    }
    
    // 哈希密码
    const passwordHash = await this.hashPassword(password)
    
    // 创建用户
    return await this.db.createUser(username, passwordHash)
  }

  async login(username: string, password: string): Promise<User | null> {
    // 获取用户
    const user = await this.db.getUserByUsername(username)
    if (!user) {
      return null
    }
    
    // 验证密码
    const isValid = await this.verifyPassword(password, user.password_hash)
    if (!isValid) {
      return null
    }
    
    return user
  }

  async hashPassword(password: string): Promise<string> {
    // 简单的哈希函数，实际生产环境应使用bcrypt或argon2
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    const newHash = await this.hashPassword(password)
    return newHash === hash
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<boolean> {
    const user = await this.db.getUserById(userId)
    if (!user) {
      return false
    }
    
    // 验证旧密码
    const isValid = await this.verifyPassword(oldPassword, user.password_hash)
    if (!isValid) {
      return false
    }
    
    // 验证新密码
    if (!newPassword || newPassword.length < 6) {
      return false
    }
    
    // 更新密码
    const newHash = await this.hashPassword(newPassword)
    const updated = await this.db.updateUser(userId, { password_hash: newHash })
    return updated !== null
  }
}