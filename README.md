# SubSense 介绍

SubSense 是一个基于 Supabase 构建的订阅管理应用，旨在帮助用户轻松管理和跟踪他们的订阅。该应用提供了一个用户友好的界面，让用户可以添加、编辑和删除他们的订阅，同时还提供了提醒功能，以便在订阅到期或即将到期时提醒用户。

# 数据表信息

supabase 上的 users 表：

```sql
-- 创建 subscriptions 表
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  provider TEXT,
  cost DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'CNY',
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'quarterly', 'yearly')),
  start_date DATE NOT NULL,
  renewal_date DATE NOT NULL,
  payment_method TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled')),
  category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- 启用行级安全策略
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- 创建行级安全策略
CREATE POLICY "用户只能查看自己的订阅" 
ON subscriptions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "用户只能插入自己的订阅" 
ON subscriptions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户只能更新自己的订阅" 
ON subscriptions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "用户只能删除自己的订阅" 
ON subscriptions 
FOR DELETE 
USING (auth.uid() = user_id);

-- 创建索引以提高查询性能
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_renewal_date ON subscriptions(renewal_date);
```