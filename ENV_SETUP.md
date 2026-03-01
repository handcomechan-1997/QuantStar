# 环境变量配置说明

## 🔐 API Key 安全配置

### 配置步骤

1. **创建环境变量文件**
   ```bash
   cp .env.example .env.local
   ```

2. **添加您的 DeepSeek API Key**
   
   编辑 `.env.local` 文件：
   ```env
   REACT_APP_DEEPSEEK_API_KEY=your_api_key_here
   ```

3. **获取 API Key**
   - 访问 [DeepSeek 官网](https://www.deepseek.com/)
   - 注册账号并获取 API Key
   - 将 Key 填入 `.env.local` 文件

4. **重启开发服务器**
   ```bash
   npm start
   ```

### 🔒 安全说明

**⚠️ 重要提示：**

- ✅ `.env.local` 文件已在 `.gitignore` 中配置
- ✅ 该文件**不会**被 Git 追踪
- ✅ 该文件**不会**上传到 GitHub
- ✅ 您的 API Key 是安全的

**⚠️ 请务必：**

- ❌ 不要将 `.env.local` 文件提交到 Git
- ❌ 不要在代码中硬编码 API Key
- ❌ 不要在公开渠道分享您的 API Key
- ✅ 定期更换 API Key 以确保安全

### 📁 文件说明

| 文件 | 说明 | Git 状态 |
|------|------|----------|
| `.env.example` | 示例配置文件 | ✅ 会被提交 |
| `.env.local` | 真实配置文件 | ❌ 不会被提交 |

### 🧪 验证配置

启动项目后，在 AI 投顾页面应该看到：
```
AI 模型 ● 已配置
```

### 🆘 常见问题

**Q: 为什么我的 API Key 不生效？**
A: 请确保：
- 文件名是 `.env.local`（注意前面的点）
- 变量名是 `REACT_APP_DEEPSEEK_API_KEY`
- 已重启开发服务器

**Q: 如何检查 API Key 是否安全？**
A: 运行以下命令：
```bash
git status
# .env.local 不应该出现在列表中

git ls-files | grep .env.local
# 应该没有输出
```

**Q: 如果不小心提交了 API Key 怎么办？**
A: 
1. 立即在 DeepSeek 后台删除该 Key
2. 生成新的 Key
3. 更新 `.env.local` 文件
4. 联系 GitHub 支持删除历史记录

### 📚 相关文档

- [React 环境变量文档](https://create-react-app.dev/docs/adding-custom-environment-variables/)
- [DeepSeek API 文档](https://www.deepseek.com/docs)
