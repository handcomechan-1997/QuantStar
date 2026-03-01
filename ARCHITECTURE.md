# QuantStar 项目架构说明

## 📋 重构概述

本次重构将原有的单文件应用（main.js, 860行代码）拆分为专业的多模块项目结构，提升了代码的可维护性、可扩展性和团队协作效率。

## 🏗️ 架构设计

### 1. 分层架构

```
┌─────────────────────────────────────────┐
│           Presentation Layer            │
│  (React Components - UI展示层)           │
├─────────────────────────────────────────┤
│           Business Logic Layer          │
│  (Custom Hooks - 业务逻辑层)             │
├─────────────────────────────────────────┤
│           Data Access Layer             │
│  (API Modules - 数据访问层)              │
├─────────────────────────────────────────┤
│           Utility Layer                 │
│  (Utils - 工具函数层)                    │
└─────────────────────────────────────────┘
```

### 2. 模块划分

#### 📡 API层 (`src/api/`)
**职责**: 封装所有外部数据接口调用

- `stockApi.js` - 股票数据API
  - `fetchTencentData()` - 获取历史K线数据
  - `fetchBatchPrices()` - 批量获取实时价格
  - `searchStocksAPI()` - 股票模糊搜索

**优势**:
- 统一管理API调用
- 便于切换数据源
- 方便添加缓存和错误处理

#### 🔧 工具层 (`src/utils/`)
**职责**: 提供纯函数工具

- `indicators.js` - 技术指标计算
  - `calculateSMA()` - 简单移动平均
  - `evaluateRule()` - 规则评估

**优势**:
- 纯函数，易于测试
- 可复用性高
- 无副作用

#### 🪝 Hooks层 (`src/hooks/`)
**职责**: 封装业务逻辑和状态管理

- `useStockData.js` - 股票数据管理
  - 自动获取历史数据
  - 管理加载状态和错误
  - 更新组合价格

- `usePaperAccount.js` - 模拟账户管理
  - 买入/卖出操作
  - 手动录入持仓
  - 盈亏计算

- `useSearch.js` - 搜索功能
  - 防抖搜索
  - 结果缓存
  - 状态管理

**优势**:
- 逻辑复用
- 关注点分离
- 易于维护和测试

#### 🎨 组件层 (`src/components/`)
**职责**: UI展示和用户交互

**通用组件**:
- `Header.jsx` - 顶部导航栏
- `StockChart.jsx` - K线图表

**功能模块**:

1. **PaperTrading** (模拟交易)
   - `PaperTrading.jsx` - 主容器
   - `ManualEntry.jsx` - 手动录入表单
   - `PositionCard.jsx` - 持仓卡片

2. **Strategy** (策略回测)
   - `StrategyBuilder.jsx` - 策略配置
   - `BacktestResult.jsx` - 回测结果

3. **AIAdvisor** (AI投顾)
   - `AIAdvisor.jsx` - AI对话主界面
   - `ChatMessage.jsx` - 消息组件

**优势**:
- 组件职责单一
- 高度模块化
- 易于扩展和维护

## 🔄 数据流

```
User Action
     ↓
Component (UI Layer)
     ↓
Custom Hook (Business Logic)
     ↓
API Module (Data Access)
     ↓
External API (Tencent/DeepSeek)
     ↓
State Update
     ↓
Component Re-render
```

## 📦 状态管理策略

采用 **React Hooks + Context** 的轻量级状态管理：

1. **本地状态** (useState)
   - 表单输入
   - UI交互状态

2. **派生状态** (useMemo/useCallback)
   - 计算属性
   - 过滤结果

3. **副作用** (useEffect)
   - 数据获取
   - 订阅管理

## 🎯 设计原则

### 1. 单一职责原则 (SRP)
每个模块只负责一个功能领域

### 2. 开闭原则 (OCP)
对扩展开放，对修改关闭

### 3. 依赖倒置原则 (DIP)
高层模块不依赖低层模块，都依赖抽象

### 4. 关注点分离 (SoC)
UI、业务逻辑、数据访问分离

## 🚀 性能优化

1. **代码分割**: 按路由/功能模块懒加载
2. **防抖优化**: 搜索输入防抖400ms
3. **请求取消**: AbortController取消超时请求
4. **多代理容错**: API请求自动切换代理

## 📈 可扩展性

### 添加新功能示例

**添加新的技术指标**:
```javascript
// src/utils/indicators.js
export const calculateEMA = (data, period) => {
  // EMA计算逻辑
};
```

**添加新的数据源**:
```javascript
// src/api/stockApi.js
export const fetchFromNewSource = async (code) => {
  // 新数据源逻辑
};
```

**添加新模块**:
```javascript
// src/components/NewFeature/
//   ├── NewFeature.jsx
//   ├── SubComponent.jsx
//   └── index.js
```

## 🧪 测试策略

### 单元测试
- API函数测试
- 工具函数测试
- Hook逻辑测试

### 集成测试
- 组件交互测试
- 数据流测试

### E2E测试
- 用户流程测试

## 📊 代码质量

### 重构前
- 单文件860行
- 所有逻辑耦合在一起
- 难以测试和维护

### 重构后
- 22个独立模块
- 清晰的分层架构
- 易于测试和维护
- 平均每个文件 < 200行

## 🔒 安全性考虑

1. API Key 不硬编码
2. 用户输入验证
3. XSS防护（React自动转义）
4. HTTPS通信

## 📝 开发规范

### 文件命名
- 组件: PascalCase (e.g., `Header.jsx`)
- 工具函数: camelCase (e.g., `indicators.js`)
- 常量: UPPER_SNAKE_CASE

### 代码风格
- 使用函数式组件
- 遵循Hooks规则
- 注释使用英文
- 变量命名语义化

## 🎓 学习价值

本项目展示了：
- ✅ 现代React开发最佳实践
- ✅ 组件化设计思想
- ✅ 状态管理策略
- ✅ API封装技巧
- ✅ 代码组织规范
- ✅ 性能优化方法

## 📚 技术栈对比

| 技术 | 用途 | 选择理由 |
|------|------|----------|
| React 18 | UI框架 | Hooks强大、生态成熟 |
| Tailwind CSS | 样式方案 | 快速开发、一致性高 |
| ECharts | 图表库 | 功能强大、A股K线标准 |
| Lucide | 图标库 | 轻量、美观 |
| DeepSeek API | AI能力 | 国产大模型、成本低 |

## 🔄 后续优化方向

1. **状态持久化**: LocalStorage/IndexedDB
2. **更多指标**: MACD、RSI、BOLL等
3. **实时推送**: WebSocket实时行情
4. **主题切换**: 暗色/亮色模式
5. **国际化**: i18n多语言支持
6. **PWA**: 离线可用
7. **测试覆盖**: Jest + Testing Library
8. **CI/CD**: GitHub Actions自动化

---

**架构设计**: Qoder AI
**版本**: v4.0
**最后更新**: 2026-03-01
