# 🚀 QuantStar 快速部署教程

## 部署到 Vercel（推荐）- 只需 5 分钟！

---

## 📋 准备工作

✅ 您已经有：
- GitHub 账号
- QuantStar 代码已推送到：https://github.com/handcomechan-1997/QuantStar
- DeepSeek API Key：`sk-2e012410d4cc4849a1d2de6b0c60ea47`

---

## 第一步：注册 Vercel 账号（1分钟）

### 1.1 打开 Vercel 官网

在浏览器中访问：**https://vercel.com**

### 1.2 点击注册

点击右上角的 **"Sign Up"** 按钮

### 1.3 选择 GitHub 登录

选择 **"Continue with GitHub"**

### 1.4 授权 Vercel

- 点击 **"Authorize Vercel"**
- 允许 Vercel 访问您的 GitHub 仓库

### 1.5 完成注册

- 填写用户名（可以和 GitHub 相同）
- 点击 **"Continue"**
- 选择 **"Free"** 免费计划
- 点击 **"Continue"** 完成注册

✅ **第一步完成！**

---

## 第二步：导入项目（2分钟）

### 2.1 进入控制台

登录后，您会看到 Vercel 控制台

### 2.2 创建新项目

点击 **"Add New..."** → 选择 **"Project"**

### 2.3 选择仓库

在 "Import Git Repository" 页面：

1. 确保 **"GitHub"** 选项卡被选中
2. 找到 **"handcomechan-1997/QuantStar"**
3. 点击 **"Import"** 按钮

> 💡 如果看不到仓库，点击 **"Adjust GitHub App Permissions"**
> 勾选 "All repositories" 或选择特定仓库

### 2.4 配置项目

在 "Configure Project" 页面：

**基本配置**（自动识别，无需修改）：
- Project Name: `quantstar`
- Framework Preset: **Create React App** ✅
- Root Directory: `./`
- Build Command: `npm run build`
- Output Directory: `build`

✅ **第二步完成！**

---

## 第三步：配置环境变量（重要！1分钟）

### 3.1 展开环境变量设置

在 "Configure Project" 页面向下滚动，找到 **"Environment Variables"** 区域

### 3.2 添加环境变量

输入以下信息：

**第一行**：
```
Key:   REACT_APP_DEEPSEEK_API_KEY
Value: sk-2e012410d4cc4849a1d2de6b0c60ea47
```

### 3.3 选择环境

确保以下三个选项**全部勾选**：
- ✅ Production
- ✅ Preview
- ✅ Development

### 3.4 确认添加

点击 **"Add"** 按钮，确认环境变量已添加

> ⚠️ **重要提示**：如果不添加这个环境变量，AI 投顾功能将无法正常工作！

✅ **第三步完成！**

---

## 第四步：部署项目（1分钟）

### 4.1 开始部署

点击页面底部的 **"Deploy"** 按钮

### 4.2 等待部署

- Vercel 会自动构建项目
- 通常需要 **1-2 分钟**
- 您会看到构建日志滚动

### 4.3 部署成功

当看到 🎉 **庆祝画面**（五彩纸屑动画）时，表示部署成功！

✅ **第四步完成！**

---

## 第五步：获取网站地址

### 5.1 查看部署详情

点击 **"Continue to Dashboard"**

### 5.2 获取访问链接

在控制台顶部，您会看到：

```
🌐 生产环境地址：
https://quantstar.vercel.app

或者类似：
https://quantstar-abc123.vercel.app
```

### 5.3 复制链接

点击复制按钮，复制这个链接

✅ **第五步完成！**

---

## 第六步：测试网站

### 6.1 打开网站

在浏览器中打开您的链接：`https://quantstar.vercel.app`

### 6.2 检查功能清单

- [ ] 网站正常加载，没有空白
- [ ] 搜索功能正常（输入 `飞龙` 测试）
- [ ] K线图表正常显示
- [ ] 切换到 **AI 投顾** 标签页
- [ ] 看到 **"● 已配置"** 绿色标记
- [ ] 输入问题测试 AI 功能
- [ ] 模拟交易功能正常

✅ **全部通过！部署成功！**

---

## 🎉 分享给朋友

现在您可以把链接分享给朋友了！

```
分享链接：https://quantstar.vercel.app
```

朋友打开后可以：
- ✅ 搜索股票
- ✅ 查看行情
- ✅ 使用模拟交易
- ✅ 与 AI 投顾对话
- ✅ 测试交易策略

**完全免费，无需注册！**

---

## 🔄 自动更新

以后您修改代码，只需推送到 GitHub：

```bash
git add .
git commit -m "更新功能"
git push
```

**Vercel 会自动重新部署！** 约 1-2 分钟后生效。

---

## 📱 常见问题

### Q1: 网站显示空白？

**解决方案**：
1. 打开浏览器控制台（F12）
2. 查看是否有错误
3. 检查环境变量是否正确配置
4. 在 Vercel 控制台点击 "Redeploy" 重新部署

### Q2: AI 投顾不工作？

**解决方案**：
1. 进入项目设置：Settings → Environment Variables
2. 检查 `REACT_APP_DEEPSEEK_API_KEY` 是否存在
3. 值是否正确：`sk-2e012410d4cc4849a1d2de6b0c60ea47`
4. 重新部署项目

### Q3: 如何修改域名？

**解决方案**：
1. 进入项目设置：Settings → Domains
2. 点击 "Add" 添加自定义域名
3. 按提示配置 DNS

### Q4: 如何查看部署日志？

**解决方案**：
1. 进入项目控制台
2. 点击 "Deployments" 标签
3. 点击具体的部署记录
4. 查看 "Build Logs"

### Q5: 如何回滚到之前的版本？

**解决方案**：
1. 进入 "Deployments" 标签
2. 找到历史版本
3. 点击右侧的 "..." 菜单
4. 选择 "Promote to Production"

---

## 🆘 需要帮助？

如果遇到问题：

1. 查看 Vercel 文档：https://vercel.com/docs
2. 查看项目部署日志
3. 检查浏览器控制台错误
4. 在 GitHub 提交 Issue

---

## 📸 图文教程补充

### 环境变量配置截图说明

```
Environment Variables
┌─────────────────────────────────────────┐
│ Key                                 Value│
│ REACT_APP_DEEPSEEK_API_KEY    sk-2e01...│
│ ✅ Production  ✅ Preview  ✅ Development │
│                                    [Add] │
└─────────────────────────────────────────┘
```

### 部署成功截图说明

```
┌─────────────────────────────────────────┐
│           🎉 Congratulations!            │
│                                          │
│   Your project has been deployed!        │
│                                          │
│   🌐 https://quantstar.vercel.app       │
│                                          │
│   [Visit]  [Continue to Dashboard]      │
└─────────────────────────────────────────┘
```

---

## 🎯 快速回顾

1. **注册 Vercel** - 用 GitHub 登录
2. **导入项目** - 选择 QuantStar 仓库
3. **配置环境变量** - 添加 API Key
4. **点击部署** - 等待 1-2 分钟
5. **获取链接** - 分享给朋友

**总耗时：约 5 分钟**

---

## 💡 专业提示

### 提示 1: 预览部署

每次推送代码，Vercel 会创建预览链接：
- 生产环境：`https://quantstar.vercel.app`
- 预览环境：`https://quantstar-git-branch-xxx.vercel.app`

### 提示 2: 多环境管理

可以创建多个环境：
- Production（生产）
- Preview（预览）
- Development（开发）

### 提示 3: 性能监控

Vercel 提供：
- 访问统计
- 性能监控
- 错误追踪

在 "Analytics" 标签页查看

---

**现在开始部署吧！5分钟后您的朋友就能访问了！🚀**
