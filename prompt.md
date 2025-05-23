我订阅了很多在线和线下的服务，需要有一个工具来统一管理，帮助我了解我订阅相关的财务状况。产品信息如下：

# 产品名称

SubSense 订阅智管

# 产品需求

## 1. 基础订阅管理
- 订阅服务添加与管理
  - 添加各类订阅服务（流媒体、音乐、购物会员等）
  - 记录关键信息：
    - 订阅名称和服务提供商
    - 订阅费用（支持常见币种）
    - 计费周期（月付/季付/年付）
    - 订阅开始日期
    - 续费/到期日期
    - 支付方式
    - 简单备注
  - 订阅状态标记（活跃/已取消）
  - 列表视图和详情视图

## 2. 财务分析功能
- 订阅费用统计与可视化
  - 月度/年度总支出计算
  - 按类别的费用分布饼图
  - 简单的费用趋势图表
  - 即将到期的订阅提醒
  - 月度/年度订阅总额预览
## 3. 用户功能（复用 Supabase 用户能力）

# 技术方案

## 技术栈概览

- 前端 ：Vue.js
- 后端 ：Supabase（数据库、认证、存储）
- 部署 ：Vercel
- 编程语言 ：JavaScript

### 1. 前端架构
- 框架 ：Vue 3 + Vite（快速开发体验，无需复杂配置）
- UI 组件库 ：建议使用 Naive UI 或 Element Plus（中文友好且与 Vue 3 兼容）
- 状态管理 ：Pinia（Vue 3 推荐的状态管理方案，简单易用）
- 路由 ：Vue Router
- 图表库 ：ECharts（用于财务分析可视化）

# 设计方案

1. 设计风格：
   - 极简主义设计，干净整洁的界面
   - 卡片式布局，使用圆角矩形卡片展示信息
   - 柔和的色彩方案，主要使用白色、浅灰色背景，辅以品牌原色点缀
   - 圆形图标设计
   - 清晰的视觉层次结构

2. 主要组件需求：
   - 顶部概览区域：显示月均支出和活跃订阅数量
   - 服务卡片组件：展示服务图标、名称、价格和续费日期
   - 状态指示器：使用小圆点或标签显示订阅状态
   - 添加按钮：简洁的"添加新订阅"按钮
   - 列表视图：展示所有订阅的详细信息

3. 交互设计：
   - 点击卡片查看详情
   - 滑动或点击操作管理订阅
   - 简洁的添加流程