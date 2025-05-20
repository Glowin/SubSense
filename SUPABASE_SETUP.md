# SubSense Supabase 集成指南

本文档提供了 SubSense 应用与 Supabase 集成的详细说明，包括环境设置、数据库配置和认证功能的使用方法。

## 环境配置

项目已经创建了 `.env.local` 文件，其中包含了 Supabase 的连接信息：

```
VITE_SUPABASE_URL=https://xyzgqiepcbrjutuonaik.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5emdxaWVwY2JyanV0dW9uYWlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3Mzg4MDYsImV4cCI6MjA2MzMxNDgwNn0.HknyWaMonVtRsQBDjf87peQO1Ll1Sw5KLg50zsSvSpI
```

这些环境变量会被 Vite 自动加载，并在应用中通过 `import.meta.env` 访问。

## Supabase 数据库配置

### 数据表结构

在 Supabase 中，需要创建以下数据表：

#### 订阅表 (subscriptions)

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | uuid | 主键，自动生成 |
| user_id | uuid | 外键，关联用户 |
| name | text | 订阅名称 |
| provider | text | 服务提供商 |
| cost | numeric | 费用金额 |
| currency | text | 货币类型 |
| billingCycle | text | 计费周期 |
| startDate | date | 开始日期 |
| renewalDate | date | 续费日期 |
| paymentMethod | text | 支付方式 |
| notes | text | 备注信息 |
| status | text | 状态 (active/cancelled) |
| category | text | 分类 |
| created_at | timestamp | 创建时间 |

### 行级安全策略

为确保数据安全，需要在 Supabase 中设置行级安全策略 (RLS)：

```sql
-- 启用 RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- 创建策略：用户只能查看和修改自己的订阅
CREATE POLICY "用户可以查看自己的订阅" 
  ON subscriptions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "用户可以插入自己的订阅" 
  ON subscriptions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可以更新自己的订阅" 
  ON subscriptions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "用户可以删除自己的订阅" 
  ON subscriptions 
  FOR DELETE 
  USING (auth.uid() = user_id);
```

## 用户认证

### 功能概述

本应用已集成 Supabase 认证系统，支持以下功能：

- 用户注册
- 邮箱密码登录
- 密码重置
- 用户登出

### 使用方法

1. 访问 `/auth` 路由进入登录/注册页面
2. 新用户可以点击「立即注册」创建账号
3. 已有账号的用户可以直接登录
4. 忘记密码时可以点击「忘记密码」进行重置

### 开发说明

认证相关功能封装在以下文件中：

- `src/lib/supabase.js` - Supabase 客户端和认证方法
- `src/stores/authStore.js` - 认证状态管理
- `src/views/Auth.vue` - 登录/注册界面

## 数据操作

### 订阅数据管理

订阅数据的 CRUD 操作已封装在 `src/lib/supabase.js` 的 `subscriptionService` 对象中：

- `getAllSubscriptions` - 获取用户所有订阅
- `getSubscription` - 获取单个订阅详情
- `createSubscription` - 创建新订阅
- `updateSubscription` - 更新订阅信息
- `deleteSubscription` - 删除订阅

这些方法已在 `src/stores/subscriptionStore.js` 中集成，可以通过 Pinia store 进行调用。

## 路由保护

应用已配置路由守卫，确保只有登录用户才能访问受保护的页面。未登录用户将被重定向到登录页面。

## 开发与调试

### 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 环境切换

如需切换到其他 Supabase 项目，只需修改 `.env.local` 文件中的 URL 和密钥即可。

## 部署

构建生产版本：

```bash
npm run build
```

部署到 Vercel 时，需要在环境变量中设置 Supabase 的 URL 和密钥。