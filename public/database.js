// 数据库初始化脚本
// 在Cloudflare Pages中，D1数据库需要通过Workers访问
// 这是一个模拟版本，实际部署需要配置D1绑定

// 模拟用户数据存储
const usersDB = {
  // 用户数据存储在内存中（实际应该使用D1）
  users: [],
  
  // 初始化
  init() {
    console.log('📊 数据库初始化');
    // 从localStorage加载模拟数据
    const saved = localStorage.getItem('novel-site-users');
    if (saved) {
      try {
        this.users = JSON.parse(saved);
        console.log(`📊 加载了 ${this.users.length} 个用户`);
      } catch (e) {
        console.error('❌ 加载用户数据失败:', e);
      }
    }
  },
  
  // 保存到localStorage
  save() {
    localStorage.setItem('novel-site-users', JSON.stringify(this.users));
  },
  
  // 创建用户
  createUser(username, password) {
    // 检查用户名是否已存在
    if (this.users.some(u => u.username === username)) {
      return { success: false, message: '用户名已存在' };
    }
    
    // 创建新用户
    const newUser = {
      id: Date.now().toString(),
      username: username,
      password: password, // 实际应该加密
      createdAt: new Date().toISOString(),
      isAdmin: false
    };
    
    this.users.push(newUser);
    this.save();
    
    console.log(`✅ 创建用户: ${username}`);
    return { success: true, user: newUser };
  },
  
  // 验证用户
  authenticate(username, password) {
    const user = this.users.find(u => 
      u.username === username && u.password === password
    );
    
    if (user) {
      console.log(`✅ 用户验证成功: ${username}`);
      return { success: true, user };
    }
    
    console.log(`❌ 用户验证失败: ${username}`);
    return { success: false, message: '用户名或密码错误' };
  },
  
  // 获取所有用户
  getAllUsers() {
    return [...this.users];
  },
  
  // 获取用户数量
  getUserCount() {
    return this.users.length;
  }
};

// 模拟小说数据存储
const novelsDB = {
  novels: [],
  
  init() {
    const saved = localStorage.getItem('novel-site-novels');
    if (saved) {
      try {
        this.novels = JSON.parse(saved);
        console.log(`📚 加载了 ${this.novels.length} 篇小说`);
      } catch (e) {
        console.error('❌ 加载小说数据失败:', e);
      }
    }
  },
  
  save() {
    localStorage.setItem('novel-site-novels', JSON.stringify(this.novels));
  },
  
  createNovel(title, author, content) {
    const newNovel = {
      id: Date.now().toString(),
      title: title,
      author: author,
      content: content || '',
      chapters: [],
      createdAt: new Date().toISOString(),
      status: 'published'
    };
    
    this.novels.push(newNovel);
    this.save();
    
    console.log(`📖 创建小说: ${title} (作者: ${author})`);
    return { success: true, novel: newNovel };
  },
  
  getAllNovels() {
    return [...this.novels];
  },
  
  getNovelCount() {
    return this.novels.length;
  }
};

// 初始化数据库
document.addEventListener('DOMContentLoaded', function() {
  usersDB.init();
  novelsDB.init();
  
  // 更新页面统计数据
  updateStats();
  
  console.log('📊 数据库系统已初始化');
  console.log(`👤 用户数: ${usersDB.getUserCount()}`);
  console.log(`📚 小说数: ${novelsDB.getNovelCount()}`);
});

// 更新页面统计数据
function updateStats() {
  // 更新用户数
  const userCountElements = document.querySelectorAll('.stat-number:contains("0")');
  if (userCountElements.length > 1) {
    userCountElements[1].textContent = usersDB.getUserCount();
  }
  
  // 更新小说数
  const novelCountElements = document.querySelectorAll('.stat-number:contains("0")');
  if (novelCountElements.length > 0) {
    novelCountElements[0].textContent = novelsDB.getNovelCount();
  }
}

// 导出到全局
window.novelSiteDB = {
  users: usersDB,
  novels: novelsDB,
  updateStats: updateStats
};