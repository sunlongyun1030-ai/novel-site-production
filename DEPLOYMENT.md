# Cloudflare Pages 生产环境部署指南

## 项目概述
这是一个专为小学生设计的小说创作平台，使用以下技术栈：
- **前端**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **后端**: Cloudflare Workers + D1 SQLite数据库
- **部署**: Cloudflare Pages + GitHub Actions
- **认证**: 基于内存存储的用户认证系统

## 部署状态
✅ **GitHub仓库**: 已创建并推送代码
✅ **Cloudflare Pages项目**: 已创建 (novel-site-d1.pages.dev)
⚠️ **GitHub集成**: 需要手动配置
⚠️ **自动部署**: 需要配置GitHub Secrets

## 手动部署步骤

### 1. 构建项目
```bash
npm run build
```

### 2. 部署到Cloudflare Pages
```bash
npm run deploy
```

### 3. 预览部署
```bash
npm run deploy:preview
```

## 自动部署配置

### 1. 配置GitHub Secrets
在GitHub仓库设置中，添加以下Secrets：

| Secret名称 | 值 | 说明 |
|-----------|-----|------|
| `CLOUDFLARE_API_TOKEN` | `YOUR_CLOUDFLARE_API_TOKEN_HERE` | Cloudflare API令牌 |
| `CLOUDFLARE_ACCOUNT_ID` | `YOUR_CLOUDFLARE_ACCOUNT_ID_HERE` | Cloudflare账户ID |

### 2. 配置步骤
1. 访问: https://github.com/sunlongyun1030-ai/novel-site-d1/settings/secrets/actions
2. 点击 "New repository secret"
3. 添加上述两个Secrets

### 3. 触发自动部署
- **推送代码到main分支**: 自动触发生产部署
- **创建Pull Request**: 自动触发预览部署

## Cloudflare Pages配置

### 项目信息
- **项目名称**: novel-site-d1
- **项目ID**: ae53eb9b-aeb0-4ebd-85d7-b26ca21f5326
- **子域名**: https://novel-site-d1.pages.dev
- **生产分支**: main

### 构建配置
- **构建命令**: `npm run build`
- **输出目录**: `.next`
- **Node版本**: 18
- **环境变量**: 
  - `NODE_ENV=production` (生产环境)
  - `NODE_ENV=development` (预览环境)

### D1数据库配置
- **数据库名称**: novel-site-db
- **数据库ID**: be4e1044-b2b0-47ef-b2aa-7aca4687a717
- **绑定名称**: DB

## 环境变量配置

### 生产环境变量
在Cloudflare Pages仪表板中配置以下环境变量：

1. 访问: https://dash.cloudflare.com/789d3ea721faee54481f50caeb25cf9b/pages/novel-site-d1/settings/environment-variables
2. 添加以下变量:
   - `NODE_ENV`: `production`
   - `NODE_VERSION`: `18`

## 域名配置（可选）

### 自定义域名
1. 在Cloudflare Pages项目设置中，点击"自定义域"
2. 添加您的域名（如: novel.yourdomain.com）
3. 按照提示配置DNS记录

### SSL证书
- Cloudflare自动提供免费的SSL证书
- 证书自动续期
- 支持HTTPS访问

## 监控和日志

### 访问日志
1. 登录Cloudflare仪表板
2. 进入Pages项目
3. 点击"部署"查看部署历史
4. 点击具体部署查看日志

### 错误监控
- 构建错误: 在部署日志中查看
- 运行时错误: 在浏览器控制台查看
- API错误: 在Worker日志中查看

## 故障排除

### 常见问题

#### 1. 构建失败
```bash
# 本地测试构建
npm run build
```

#### 2. 部署失败
- 检查GitHub Secrets配置
- 检查Cloudflare API令牌权限
- 查看GitHub Actions日志

#### 3. 运行时错误
- 检查浏览器控制台
- 检查Network标签页的API请求
- 验证D1数据库连接

#### 4. 数据库连接问题
```bash
# 测试数据库连接
npx wrangler d1 execute novel-site-db --remote --command="SELECT COUNT(*) as count FROM novels"
```

## 备份和恢复

### 数据库备份
```bash
# 导出数据库
npx wrangler d1 export novel-site-db --remote --output=backup.sql
```

### 数据库恢复
```bash
# 导入数据库
npx wrangler d1 execute novel-site-db --remote --file=backup.sql
```

## 性能优化

### 缓存配置
- Cloudflare CDN自动缓存静态资源
- 图片和CSS文件有长期缓存
- API响应可配置缓存策略

### 图片优化
- 使用Next.js Image组件自动优化
- 支持WebP格式
- 响应式图片加载

## 安全配置

### 访问控制
- 用户认证系统
- 管理员权限控制
- 输入验证和清理

### API安全
- 请求频率限制
- SQL注入防护
- XSS攻击防护

## 更新和维护

### 代码更新
1. 推送代码到GitHub
2. 自动触发部署
3. 验证部署结果

### 数据库迁移
1. 创建迁移脚本
2. 测试迁移
3. 应用迁移

### 版本回滚
1. 在Cloudflare Pages中选择之前的部署
2. 点击"回滚到此版本"
3. 验证回滚结果

## 支持联系方式

### 技术问题
- GitHub Issues: https://github.com/sunlongyun1030-ai/novel-site-d1/issues
- Cloudflare支持: https://support.cloudflare.com

### 紧急问题
- 检查部署状态: https://dash.cloudflare.com/789d3ea721faee54481f50caeb25cf9b/pages
- 查看系统状态: https://www.cloudflarestatus.com

---

**部署完成时间**: $(date)
**部署状态**: ✅ 项目已准备好进行生产部署
**下一步**: 配置GitHub Secrets并推送代码以触发自动部署