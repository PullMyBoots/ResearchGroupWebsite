# 焦熙昀教授课题组网站

南方科技大学统计与数据科学系课题组官方网站

## 项目简介

这是一个功能完整的学术课题组网站，旨在展示课题组的研究成果、团队成员信息，并为组员提供内部协作平台。

### 主要功能

**对外展示**
- 课题组介绍和研究方向展示
- 团队成员信息展示
- 学术成果（论文）展示
- 成员个人主页

**内部协作**
- 成员个人信息自主管理
- 头像和简历上传
- 内部学术资料分享
- 评论和讨论功能

**用户管理**
- 基于 Manus OAuth 的用户认证
- 管理员和普通用户角色区分
- 权限控制

## 技术栈

- **前端**: React 19 + TypeScript + Tailwind CSS + shadcn/ui
- **后端**: Node.js + Express + tRPC
- **数据库**: MySQL (Drizzle ORM)
- **文件存储**: S3
- **认证**: Manus OAuth
- **部署**: Vercel (推荐)

## 项目结构

```
research-group-website/
├── client/                 # 前端代码
│   ├── src/
│   │   ├── pages/         # 页面组件
│   │   │   ├── Home.tsx           # 首页
│   │   │   ├── Members.tsx        # 团队成员列表
│   │   │   ├── MemberDetail.tsx   # 成员详情
│   │   │   ├── Publications.tsx   # 学术成果
│   │   │   ├── Shares.tsx         # 内部分享
│   │   │   └── Profile.tsx        # 个人中心
│   │   ├── components/    # UI组件
│   │   │   ├── ui/               # shadcn/ui组件
│   │   │   └── DashboardLayout.tsx
│   │   └── lib/           # 工具库
│   │       └── trpc.ts           # tRPC客户端
│   └── public/            # 静态资源
├── server/                # 后端代码
│   ├── routers.ts        # tRPC路由定义
│   ├── db.ts             # 数据库查询函数
│   ├── storage.ts        # S3文件存储
│   └── _core/            # 核心功能
│       ├── trpc.ts              # tRPC配置
│       ├── context.ts           # 请求上下文
│       └── env.ts               # 环境变量
├── drizzle/              # 数据库
│   └── schema.ts         # 数据库表结构
├── shared/               # 共享代码
│   └── const.ts          # 常量定义
└── README.md
```

## 数据库设计

### 核心数据表

**users** - 用户表
- 存储用户基本信息和认证数据
- 支持管理员和普通用户角色

**profiles** - 成员档案表
- 存储成员的详细信息
- 包括头像、简介、研究兴趣、学术链接等

**publications** - 学术成果表
- 存储论文信息
- 支持关联到具体成员

**shares** - 内部分享表
- 存储分享的内容
- 支持论文推荐、博客推荐、组会讲义等类型

**share_comments** - 分享评论表
- 存储对分享内容的评论
- 支持多级讨论

## 本地开发

### 环境要求

- Node.js 22+
- pnpm 9+
- MySQL 8+

### 安装依赖

```bash
pnpm install
```

### 配置环境变量

项目使用 Manus 平台的环境变量，已自动配置以下变量：

- `DATABASE_URL` - 数据库连接
- `JWT_SECRET` - 会话密钥
- `VITE_APP_ID` - 应用ID
- `OAUTH_SERVER_URL` - OAuth服务器
- `VITE_OAUTH_PORTAL_URL` - OAuth登录页面
- `BUILT_IN_FORGE_API_URL` - 内置API地址
- `BUILT_IN_FORGE_API_KEY` - 内置API密钥

### 初始化数据库

```bash
pnpm db:push
```

### 启动开发服务器

```bash
pnpm dev
```

访问 http://localhost:3000

## 部署

### 推荐方案：Vercel

1. 将代码推送到 GitHub
2. 在 Vercel 导入项目
3. 配置环境变量
4. 部署

详细部署指南请参考 `deployment_guide.md`

### 其他部署方案

- **Netlify**: 支持，需要配置 serverless functions
- **自托管**: 支持，使用 `pnpm build` 构建后部署到任何 Node.js 服务器

## 使用指南

### 管理员

1. 首次登录使用预设管理员账号
2. 在个人中心完善个人信息
3. 管理用户角色和权限
4. 添加和管理学术成果

### 普通成员

1. 使用 Manus OAuth 登录
2. 在个人中心填写个人信息
3. 上传头像和简历
4. 使用内部分享功能交流学术资料

详细使用说明请参考 `user_manual.md`

## 功能特性

### 响应式设计
- 支持桌面、平板、手机等多种设备
- 自适应布局

### 用户体验优化
- 友好的操作界面
- 实时数据更新
- 加载状态提示
- 错误处理和提示

### 安全性
- OAuth 认证
- 角色权限控制
- 文件上传大小限制
- XSS 防护

### 性能优化
- 代码分割
- 懒加载
- 图片优化
- CDN 加速

## 开发规范

### 代码风格

- TypeScript 严格模式
- ESLint + Prettier
- 组件化开发
- 类型安全

### Git 工作流

- main 分支：生产环境
- develop 分支：开发环境
- feature/* 分支：新功能开发
- bugfix/* 分支：bug 修复

### 提交规范

```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 重构
test: 测试
chore: 构建/工具链更新
```

## 常见问题

### 如何修改课题组名称？

编辑 `client/src/pages/Home.tsx` 文件中的相关文本。

### 如何添加新的研究方向？

在 `client/src/pages/Home.tsx` 的研究方向部分添加新的卡片组件。

### 如何自定义主题颜色？

编辑 `client/src/index.css` 文件中的 CSS 变量。

### 如何添加新的页面？

1. 在 `client/src/pages/` 创建新的页面组件
2. 在 `client/src/App.tsx` 添加路由
3. 在 `client/src/components/DashboardLayout.tsx` 添加导航菜单项（如需要）

## 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

本项目仅供焦熙昀教授课题组内部使用。

## 联系方式

- **邮箱**: jiaoxy@sustech.edu.cn
- **电话**: 0755-88015734
- **地址**: 南方科技大学统计与数据科学系

## 致谢

感谢以下开源项目：

- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [tRPC](https://trpc.io/)
- [Drizzle ORM](https://orm.drizzle.team/)

---

**版本**: v1.0.0  
**最后更新**: 2024-10-23  
**开发者**: Manus AI

