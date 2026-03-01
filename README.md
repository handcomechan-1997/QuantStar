# QuantStar ⭐

<div align="center">

**专业级A股量化交易平台**

[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![ECharts](https://img.shields.io/badge/ECharts-5.4.3-AA344D?style=flat-square)](https://echarts.apache.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3.3-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

[在线演示](#) | [功能特性](#功能特性) | [快速开始](#快速开始) | [使用指南](#使用指南)

</div>

---

## 📖 项目简介

QuantStar 是一个基于 React 的专业级A股量化交易平台，集成实时行情、模拟交易、策略回测和 AI 投顾功能。采用现代化架构设计，代码清晰、易于扩展。

### 🎯 核心亮点

- **🆓 完全免费** - 使用腾讯公开 API，无需付费数据源
- **📈 真实数据** - A股市场实时行情，前复权 K 线
- **💼 模拟交易** - 100 万虚拟资金，零风险练手
- **🤖 AI 投顾** - DeepSeek 大模型加持，智能投资建议
- **🎯 策略回测** - 无代码配置，快速验证交易策略
- **🎨 专业 UI** - 暗色主题，金融级界面设计

---

## ✨ 功能特性

### 1. 📈 实时行情分析

- **K线图表** - 专业蜡烛图，支持缩放、拖拽
- **技术指标** - MA5/MA20 均线自动计算
- **交易信号** - 买卖点可视化标记
- **多股票支持** - 支持全A股市场

### 2. 💼 模拟交易系统

- **虚拟资金** - 100 万初始资金
- **实时交易** - 按市价买入/卖出
- **持仓管理** - 自动计算浮动盈亏
- **历史记录** - 完整的交易流水
- **手动录入** - 支持录入历史持仓

### 3. 🎯 策略回测引擎

- **无代码配置** - 可视化规则设置
- **性能指标** - 总收益率、最大回撤、交易次数
- **可视化结果** - K线图上显示买卖信号

### 4. 🤖 AI 智能投顾

- **DeepSeek 大模型** - 专业投资建议
- **持仓诊断** - 一键分析当前持仓
- **智能对话** - 自然语言交互
- **实时建议** - 基于最新行情分析

### 5. 🔍 智能搜索

- **模糊搜索** - 支持拼音、代码、名称
- **快速切换** - 一键切换关注的股票
- **自选股管理** - 灵活添加/移除

---

## 🛠️ 技术栈

| 类别 | 技术 | 版本 | 说明 |
|------|------|------|------|
| **前端框架** | React | 18.2.0 | Hooks + 函数式组件 |
| **UI 框架** | Tailwind CSS | 3.3.3 | 原子化 CSS |
| **图表库** | ECharts | 5.4.3 | 专业金融图表 |
| **图标库** | Lucide React | 0.263.1 | 现代化图标 |
| **AI 引擎** | DeepSeek API | - | 大语言模型 |
| **数据源** | 腾讯股票 API | - | 免费公开数据 |

---

## 🚀 快速开始

### 环境要求

- Node.js >= 14.0.0
- npm >= 6.0.0

### 安装步骤

```bash
# 1. 克隆项目
git clone https://github.com/handcomechan-1997/QuantStar.git
cd QuantStar

# 2. 安装依赖
npm install

# 3. 配置环境变量（可选）
cp .env.example .env.local
# 编辑 .env.local，添加你的 DeepSeek API Key

# 4. 启动开发服务器
npm start

# 5. 打开浏览器访问
# http://localhost:3000
```

### 环境变量配置

创建 `.env.local` 文件（可选）：

```env
# DeepSeek API Key（用于 AI 投顾功能）
REACT_APP_DEEPSEEK_API_KEY=your_api_key_here
```

> 💡 **提示**: 不配置 API Key 也可以使用其他功能，只是 AI 投顾会使用模拟回复

---

## 📚 使用指南

### 基本操作流程

```
1. 搜索股票 → 2. 查看行情 → 3. 模拟交易 → 4. AI 分析
```

### 详细说明

#### 🔍 搜索股票

支持三种搜索方式：

- **拼音缩写**: 输入 `gzmt` 搜索贵州茅台
- **股票代码**: 输入 `600519` 直接定位
- **中文名称**: 输入 `茅台` 进行模糊匹配

#### 📊 查看行情

- 自动加载 300 天历史 K 线
- 显示 MA5（黄色）、MA20（紫色）均线
- 鼠标悬停查看详细数据
- 滚轮缩放，拖拽移动

#### 💰 模拟交易

1. 切换到 **模拟盘** 标签页
2. 输入购买股数（必须是 100 的倍数）
3. 点击 **按市价买入** 或 **按市价卖出**
4. 查看持仓盈亏实时变化

#### 🎯 策略回测

1. 切换到 **策略** 标签页
2. 默认策略：价格上穿 MA20 买入，下穿 MA5 卖出
3. 点击 **运行回测**
4. 查看回测报告和交易信号

#### 🤖 AI 投顾

1. 切换到 **AI 投顾** 标签页
2. 直接输入问题，或点击 **分析我的模拟持仓情况**
3. 获取专业的投资建议

---

## 📁 项目结构

```
QuantStar/
├── public/                 # 静态资源
│   └── index.html
├── src/
│   ├── api/               # API 层
│   │   └── stockApi.js    # 股票数据接口
│   ├── utils/             # 工具函数
│   │   └── indicators.js  # 技术指标计算
│   ├── hooks/             # 自定义 Hooks
│   │   ├── useStockData.js
│   │   ├── usePaperAccount.js
│   │   └── useSearch.js
│   ├── components/        # UI 组件
│   │   ├── Header.jsx
│   │   ├── StockChart.jsx
│   │   ├── PaperTrading/  # 模拟交易模块
│   │   ├── Strategy/      # 策略回测模块
│   │   └── AIAdvisor/     # AI 投顾模块
│   ├── App.jsx            # 主应用
│   ├── index.jsx          # 入口文件
│   └── index.css          # 全局样式
├── .env.example           # 环境变量示例
├── .env.local             # 环境变量（已忽略）
├── .gitignore             # Git 忽略配置
├── package.json           # 项目配置
├── tailwind.config.js     # Tailwind 配置
├── README.md              # 项目文档
└── ARCHITECTURE.md        # 架构文档
```

---

## 🏗️ 架构设计

本项目采用 **分层架构** 设计：

```
┌─────────────────────────────────────────┐
│        Presentation Layer (UI)          │
│         React Components                │
├─────────────────────────────────────────┤
│     Business Logic Layer (Hooks)        │
│         Custom Hooks                    │
├─────────────────────────────────────────┤
│      Data Access Layer (API)            │
│         API Modules                     │
├─────────────────────────────────────────┤
│        Utility Layer (Utils)            │
│         Helper Functions                │
└─────────────────────────────────────────┘
```

详细设计请参考 [ARCHITECTURE.md](ARCHITECTURE.md)

---

## 🎨 界面预览

### 主界面

```
┌─────────────────────────────────────────────────────┐
│  QuantStar  │ [自选股 ▼] [🔍 搜索股票...]  │ ¥1850.00 │
├─────────────────────────────────────────────────────┤
│                                        │            │
│   贵州茅台 (600519)  ⭐               │  [策略]    │
│                                        │  [模拟盘]  │
│   ┌──────────────────────────────┐    │  [AI投顾]  │
│   │      K 线 图 表               │    │            │
│   │   📈 MA5 MA20               │    │  ┌────────┐│
│   │                              │    │  │总资产  ││
│   └──────────────────────────────┘    │  │¥1.2M  ││
│                                        │  │持仓... ││
│   [回测报告]                           │  └────────┘│
└─────────────────────────────────────────────────────┘
```

---

## 🔒 安全性

### API Key 安全

- ✅ 环境变量存储，不硬编码
- ✅ `.env.local` 自动被 Git 忽略
- ✅ 永远不会上传到 GitHub

### 数据安全

- ✅ 仅使用公开 API，无需账户注册
- ✅ 所有交易为虚拟模拟，无真实资金风险
- ✅ 数据仅在浏览器本地存储

---

## 🧪 测试

```bash
# 运行测试
npm test

# 构建生产版本
npm run build
```

---

## 📈 性能优化

- ✅ 代码分割与懒加载
- ✅ 搜索防抖（400ms）
- ✅ 请求超时控制（6秒）
- ✅ 多代理自动切换
- ✅ 图表自适应调整

---

## 🤝 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

### 代码规范

- 使用函数式组件和 Hooks
- 遵循 ESLint 规则
- 保持代码简洁清晰
- 添加必要的注释

---

## 📝 更新日志

### v4.0.0 (2026-03-01)

- ✨ 全新架构重构，模块化设计
- ✨ 集成 DeepSeek AI 投顾
- ✨ 策略回测引擎
- ✨ 模拟交易系统
- ✨ 真实 A 股行情数据
- ✨ 智能搜索功能

---

## 📄 许可证

本项目采用 [MIT License](LICENSE) 开源协议

---

## 🙏 致谢

- [腾讯股票 API](https://gu.qq.com/) - 免费行情数据
- [ECharts](https://echarts.apache.org/) - 可视化图表
- [DeepSeek](https://www.deepseek.com/) - AI 大模型
- [Lucide](https://lucide.dev/) - 图标库

---

## 📧 联系方式

- GitHub: [@handcomechan-1997](https://github.com/handcomechan-1997)
- Issues: [提交问题](https://github.com/handcomechan-1997/QuantStar/issues)

---

<div align="center">

**⭐ 如果这个项目对您有帮助，请给一个 Star ⭐**

Made with ❤️ by handcomechan-1997

</div>
