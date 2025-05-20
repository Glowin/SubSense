# SubSense Vercel 部署指南

本文档提供了将 SubSense 应用部署到 Vercel 的详细步骤指南。

## 前置准备

在开始部署之前，请确保：

1. 你已经有一个 [Vercel 账号](https://vercel.com/signup)（可以使用 GitHub、GitLab 或 Bitbucket 账号直接登录）
2. 项目代码已经推送到 GitHub、GitLab 或 Bitbucket 等代码托管平台
3. 你已经有 Supabase 项目并获取了必要的环境变量（URL 和 Anon Key）

## 部署步骤

### 1. 登录 Vercel

访问 [Vercel 官网](https://vercel.com/)，点击右上角的「Sign In」按钮登录你的账号。

### 2. 创建新项目

1. 登录后，点击控制台中的「Add New...」按钮，然后选择「Project」
2. 选择包含 SubSense 代码的 Git 仓库
   - 如果你的仓库没有显示，可能需要先导入或配置 Git 集成

### 3. 配置项目

在项目配置页面：

1. **项目名称**：可以保持默认或自定义一个名称
2. **框架预设**：Vercel 应该会自动检测到这是一个 Vue/Vite 项目，如果没有，请手动选择「Vite」
3. **构建设置**：
   - Build Command: `npm run build`（默认）
   - Output Directory: `dist`（默认）
   - Install Command: `npm install`（默认）

### 4. 环境变量配置

这一步非常重要！你需要添加 Supabase 的环境变量：

1. 在项目配置页面，找到「Environment Variables」部分
2. 添加以下环境变量：
   - `VITE_SUPABASE_URL`：你的 Supabase 项目 URL
   - `VITE_SUPABASE_ANON_KEY`：你的 Supabase 匿名密钥

这些值可以从你的 `.env.local` 文件或 Supabase 项目设置中获取。

### 5. 部署项目

1. 检查所有配置无误后，点击「Deploy」按钮
2. Vercel 将开始构建和部署你的项目，这个过程通常需要几分钟
3. 部署完成后，Vercel 会提供一个默认域名（例如：`subsense.vercel.app`）

### 6. 验证部署

1. 点击提供的部署链接，确认应用是否正常运行
2. 测试登录、注册和订阅管理等核心功能
3. 检查与 Supabase 的连接是否正常工作

## 自定义域名（可选）

如果你想使用自己的域名：

1. 在项目控制台中，点击「Settings」→「Domains」
2. 点击「Add」按钮
3. 输入你想使用的域名
4. 按照 Vercel 提供的说明配置 DNS 记录

## 持续部署

Vercel 默认启用持续部署功能。每当你推送新代码到仓库的主分支时，Vercel 会自动重新构建和部署你的应用。

## 常见问题

### 部署失败

如果部署失败，请检查：

1. 构建日志中的错误信息
2. 确认所有必要的环境变量已正确设置
3. 确认项目在本地可以成功构建（`npm run build`）

### 环境变量问题

如果应用部署成功但无法连接到 Supabase：

1. 检查环境变量名称是否正确（必须以 `VITE_` 开头）
2. 确认环境变量值是否正确
3. 重新部署项目以应用环境变量更改

### 路由问题

如果遇到刷新页面后出现 404 错误，需要配置 Vercel 的重写规则：

1. 在项目根目录创建 `vercel.json` 文件
2. 添加以下内容：

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

3. 提交并推送此文件到仓库
4. Vercel 将自动重新部署应用

## 更多资源

- [Vercel 文档](https://vercel.com/docs)
- [Vite 部署指南](https://vitejs.dev/guide/static-deploy.html)
- [Supabase 文档](https://supabase.com/docs)