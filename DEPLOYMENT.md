# 🚀 QuantStar 部署指南

本指南将帮助您免费部署 QuantStar 到云端，让朋友可以访问。

---

## 方案对比

| 方案 | 免费额度 | 部署难度 | 自动部署 | 推荐度 |
|------|---------|---------|---------|--------|
| **Vercel** | 无限制 | ⭐ 最简单 | ✅ | ⭐⭐⭐⭐⭐ |
| **Netlify** | 100GB/月 | ⭐⭐ 简单 | ✅ | ⭐⭐⭐⭐ |
| **GitHub Pages** | 无限制 | ⭐⭐⭐ 中等 | ✅ | ⭐⭐⭐ |

---

## 方案 1: Vercel 部署（强烈推荐）

### 优点
- ✅ 零配置部署
- ✅ 免费额度无限制
- ✅ 自动 HTTPS
- ✅ 自动部署（推送代码自动更新）
- ✅ 提供免费域名：`your-app.vercel.app`
- ✅ 支持环境变量

### 步骤

#### 1. 准备工作

1. **注册 Vercel 账号**
   - 访问：https://vercel.com
   - 点击 "Sign Up"
   - 选择 "Continue with GitHub"（用 GitHub 登录）

2. **确认项目已推送到 GitHub**
   ```bash
   git status
   # 应该显示：nothing to commit, working tree clean
   ```

#### 2. 部署到 Vercel

**方法 A：网页界面部署（推荐）**

1. 登录 Vercel：https://vercel.com
2. 点击 "Add New..." → "Project"
3. 选择 "Import Git Repository"
4. 找到并选择：`handcomechan-1997/QuantStar`
5. 点击 "Import"
6. 配置项目：
   - Framework Preset: **Create React App**（自动识别）
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `build`
7. **配置环境变量**：
   - 点击 "Environment Variables"
   - 添加：`REACT_APP_DEEPSEEK_API_KEY`
   - 值：`sk-2e012410d4cc4849a1d2de6b0c60ea47`
   - 选择：Production, Preview, Development（全选）
8. 点击 "Deploy"
9. 等待 1-2 分钟部署完成

**方法 B：命令行部署**

```bash
# 1. 安装 Vercel CLI
npm install -g vercel

# 2. 登录 Vercel
vercel login

# 3. 部署项目
vercel

# 4. 按提示操作：
#    - Set up and deploy? Y
#    - Which scope? 选择你的账号
#    - Link to existing project? N
#    - What's your project's name? quantstar
#    - In which directory is your code? ./

# 5. 配置环境变量
vercel env add REACT_APP_DEEPSEEK_API_KEY
# 选择：Production, Preview, Development
# 粘贴：sk-2e012410d4cc4849a1d2de6b0c60ea47

# 6. 重新部署以应用环境变量
vercel --prod
```

#### 3. 访问您的应用

部署完成后，您会获得：
- **生产环境**: `https://quantstar.vercel.app`
- **预览环境**: `https://quantstar-git-main-xxx.vercel.app`

### 自动部署

以后每次推送到 GitHub，Vercel 会自动重新部署：
```bash
git add .
git commit -m "Update features"
git push
# Vercel 自动部署，约 1 分钟后生效
```

---

## 方案 2: Netlify 部署

### 优点
- ✅ 免费额度：100GB/月
- ✅ 自动 HTTPS
- ✅ 表单处理功能
- ✅ 免费域名：`your-app.netlify.app`

### 步骤

#### 1. 准备项目

创建 `netlify.toml` 配置文件：
```toml
[build]
  command = "npm run build"
  publish = "build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### 2. 部署到 Netlify

**方法 A：网页界面部署**

1. 访问：https://app.netlify.com
2. 用 GitHub 登录
3. 点击 "Add new site" → "Import an existing project"
4. 选择 GitHub，找到 `handcomechan-1997/QuantStar`
5. 配置：
   - Build command: `npm run build`
   - Publish directory: `build`
6. 点击 "Deploy site"

**方法 B：命令行部署**

```bash
# 1. 安装 Netlify CLI
npm install -g netlify-cli

# 2. 登录 Netlify
netlify login

# 3. 初始化项目
netlify init

# 4. 部署
netlify deploy --prod
```

#### 3. 配置环境变量

1. 进入 Netlify 控制台
2. Site settings → Environment variables
3. 添加：`REACT_APP_DEEPSEEK_API_KEY`
4. 重新部署

---

## 方案 3: GitHub Pages 部署

### 优点
- ✅ 完全免费
- ✅ 与 GitHub 深度集成
- ✅ 免费域名：`username.github.io/QuantStar`

### 步骤

#### 1. 安装 gh-pages

```bash
npm install --save-dev gh-pages
```

#### 2. 修改 package.json

在 `package.json` 中添加：

```json
{
  "homepage": "https://handcomechan-1997.github.io/QuantStar",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d build"
  }
}
```

#### 3. 部署

```bash
npm run deploy
```

#### 4. 配置 GitHub Pages

1. 访问仓库设置：https://github.com/handcomechan-1997/QuantStar/settings/pages
2. Source 选择：`gh-pages` 分支
3. 等待几分钟

#### 5. 访问应用

`https://handcomechan-1997.github.io/QuantStar`

---

## 环境变量配置

⚠️ **重要**: API Key 管理建议

### 推荐做法

1. **创建多个环境变量文件**：
   ```bash
   # .env.production (生产环境)
   REACT_APP_DEEPSEEK_API_KEY=your_production_key

   # .env.local (本地开发)
   REACT_APP_DEEPSEEK_API_KEY=your_development_key
   ```

2. **在部署平台配置**：
   - Vercel: Settings → Environment Variables
   - Netlify: Site settings → Environment variables
   - GitHub Pages: 使用 GitHub Secrets

3. **安全建议**：
   - 定期轮换 API Key
   - 为不同环境使用不同的 Key
   - 监控 API 使用情况

---

## 自定义域名（可选）

### Vercel 自定义域名

1. 进入项目设置
2. Domains → Add
3. 输入您的域名
4. 按提示配置 DNS

### Netlify 自定义域名

1. Domain settings → Add custom domain
2. 配置 DNS
3. 等待 SSL 证书自动配置

---

## 部署后检查清单

- [ ] 网站可以正常访问
- [ ] 搜索功能正常
- [ ] AI 投顾功能正常（检查 API Key）
- [ ] 图表加载正常
- [ ] 模拟交易功能正常
- [ ] 移动端适配正常

---

## 常见问题

### Q: 部署后页面空白？
A: 检查浏览器控制台错误，通常是路由或环境变量问题。

### Q: API Key 不生效？
A: 
1. 确认环境变量名称正确：`REACT_APP_DEEPSEEK_API_KEY`
2. 重新部署项目
3. 清除浏览器缓存

### Q: 搜索功能不工作？
A: 本地数据库应该正常工作，网络问题不影响热门股票搜索。

### Q: 如何查看部署日志？
A: 
- Vercel: Deployments → 点击部署 → Build Logs
- Netlify: Deploys → 点击部署 → Deploy log

### Q: 如何回滚到之前的版本？
A: 
- Vercel: Deployments → 选择历史版本 → Promote to Production
- Netlify: Deploys → 选择历史版本 → Publish deploy

---

## 推荐部署方案

**对于您的情况，我强烈推荐 Vercel**：

✅ 理由：
1. 部署最简单（5分钟搞定）
2. 免费额度无限制
3. 自动部署
4. 环境变量管理方便
5. 访问速度快

---

## 需要帮助？

如果在部署过程中遇到问题：
1. 查看部署日志
2. 检查环境变量配置
3. 确认 package.json 配置正确
4. 提交 GitHub Issue

祝部署顺利！🚀
