# V免签Fox二开版 - 前端管理系统 (多用户版 + Go API)

## 项目简介

**V免签Fox二开版** 是基于原版V免签进行现代化改造的**多用户前后端分离**支付系统前端部分。采用最新的 **Vue 3 + TypeScript + art-design-pro** 技术栈，配合**高性能Go语言后端API**，为个人开发者和企业用户提供美观、易用、高性能的免签支付管理界面。

> 本项目是V免签的全面现代化版本，不仅提升了用户体验和系统稳定性，更重要的是**新增多用户支持**和**Go语言高性能后端**，同时保持原有的核心支付功能。

## 🚀 核心特色

### 💰 免签支付核心
- 🔄 **实时支付监控** - 支持微信/支付宝收款码实时监控
- 📱 **移动端适配** - 完美支持手机端支付页面
- 🎯 **自动回调** - 支付成功后自动跳转回商户网站
- 📊 **订单管理** - 完整的订单生命周期管理
- 🔐 **安全验证** - 支持签名验证和防重放攻击

### 👥 多用户系统 (新增)
- 🏢 **多商户支持** - 支持多个商户独立管理收款
- 🔑 **用户权限管理** - 基于角色的精细化权限控制
- 📊 **数据隔离** - 各用户数据完全隔离，安全可靠
- 🎛️ **独立配置** - 每个用户可独立配置支付参数
- 💼 **企业级部署** - 支持为多个客户提供SaaS服务

### ⚡ Go高性能后端 (全新架构)
- 🚀 **Go语言后端** - 高并发、低延迟的现代化API服务
- 🏗️ **RESTful API** - 统一的 `/api/v2/` 路径，符合行业标准
- 🔄 **智能认证** - 条件认证中间件，自动区分公开/私有访问
- 📈 **高性能** - 相比PHP后端性能提升10倍以上
- 🛡️ **类型安全** - Go强类型语言保证API稳定性

### 🎨 现代化界面
- 🌈 **art-design-pro 设计** - 基于Element Plus的现代化管理界面
- 🌓 **主题切换** - 支持亮色/暗色主题无缝切换
- 📱 **响应式布局** - 完美适配桌面端和移动端
- 🎯 **独立支付页面** - 专门设计的支付页面，无管理菜单干扰
- 🎭 **个性化定制** - 支持多种主题和布局配置

### 🛠️ 管理功能
- 📋 **多用户订单** - 支持筛选、搜索、用户隔离的订单管理
- 💳 **收款码管理** - 微信/支付宝收款码统一管理（支持多用户）
- 📈 **数据统计** - 多维度收款数据可视化图表展示
- ⚙️ **系统设置** - 灵活的系统参数配置（支持用户级配置）
- 👥 **用户管理** - 完整的用户注册、权限、状态管理

## 技术架构

### 核心技术栈
- **Vue 3.5** - 渐进式JavaScript框架
- **TypeScript** - 类型安全的JavaScript超集
- **Vite 6** - 下一代前端构建工具
- **Element Plus** - 基于Vue 3的组件库
- **art-design-pro** - 企业级中后台前端解决方案

### 后端API架构 (全新Go服务)
- **Go 1.21+** - 高性能后端语言
- **Gin Framework** - 轻量级高性能Web框架
- **MySQL/PostgreSQL** - 支持多种数据库
- **JWT认证** - 无状态token认证
- **RESTful设计** - 统一的API接口规范

### API服务层 (统一架构)
```typescript
// 全部使用 VmqGoService，已移除旧版ThinkPHP API
import { VmqGoService } from '@/api/vmqGoApi'

// 统一的API路径结构
/api/v2/auth/login              # 用户认证
/api/v2/me                      # 用户信息
/api/v2/orders                  # 订单管理
/api/v2/orders/:id?public=true  # 支付页面（公开访问）
/api/v2/qrcodes                 # 收款码管理
/api/v2/settings                # 系统设置
/api/v2/users                   # 用户管理（多用户功能）
```

### 开发工具链
- **ESLint** - 代码质量检查
- **Prettier** - 代码格式化
- **Stylelint** - CSS代码检查
- **TypeScript** - 类型检查和智能提示
- **Commitizen** - 规范化提交信息

### 功能依赖
- **Vue Router** - 单页应用路由
- **Pinia** - 状态管理
- **Axios** - HTTP客户端
- **ECharts** - 数据可视化
- **QRCode.vue** - 二维码生成

## 项目结构

```
frontend/
├── src/
│   ├── api/                    # API接口层
│   │   ├── vmqGoApi.ts        # Go版统一API（唯一API服务）
│   │   ├── menuApi.ts         # 菜单相关API
│   │   └── paymentApi.ts      # 支付页面API
│   ├── views/
│   │   ├── vmq/               # V免签功能模块
│   │   │   ├── payment/       # 支付页面（独立布局）
│   │   │   │   ├── PaymentPage.vue      # 扫码支付页面
│   │   │   │   ├── PaymentResult.vue    # 支付结果页面
│   │   │   │   └── QrCode.vue           # 二维码组件
│   │   │   ├── orderlist/     # 订单管理（支持多用户）
│   │   │   ├── wxqrcode/      # 微信收款码管理
│   │   │   ├── zfbqrcode/     # 支付宝收款码管理
│   │   │   ├── dashboard/     # 数据看板
│   │   │   ├── systemSettings/# 系统设置
│   │   │   ├── monitorSettings/ # 监控设置
│   │   │   └── api/           # API管理页面
│   │   ├── system/            # 系统管理
│   │   │   └── user/          # 用户管理（多用户功能）
│   │   └── auth/              # 认证模块
│   │       ├── login/         # 登录页面
│   │       └── register/      # 注册页面
│   ├── components/            # 公共组件
│   ├── router/               # 路由配置
│   │   ├── routes/
│   │   │   ├── staticRoutes.ts    # 静态路由（支付页面）
│   │   │   └── vmqRoutes.ts       # V免签功能路由
│   │   └── vmqBootstrap.ts        # 多用户路由引导
│   ├── store/                # 状态管理
│   │   └── modules/
│   │       └── user.ts            # 用户状态（支持多用户）
│   ├── composables/          # 组合式函数
│   │   └── useAuth.ts             # 认证相关
│   └── assets/               # 静态资源
├── public/                   # 公共资源
│   └── payment/              # 支付页面静态资源
└── package.json             # 项目配置
```

## 快速开始

### 环境要求
- Node.js >= 16.0.0
- pnpm >= 7.0.0 (推荐) 或 npm >= 8.0.0
- Go 1.21+ (后端服务)

### 安装依赖

```bash
# 推荐使用 pnpm
pnpm install

# 或使用 npm
npm install
```

### 开发环境

```bash
# 启动开发服务器
pnpm dev

# 访问地址
# 管理后台：http://localhost:3006
# 支付页面：http://localhost:3006/payment/:orderId
# 用户注册：http://localhost:3006/register
```

## 配置说明

### 环境变量配置

创建 `.env.local` 文件：

```env
# 应用基本配置
VITE_VERSION=2.4.2.9
VITE_PORT=3006
VITE_BASE_URL=/

# Go后端API地址
VITE_API_URL=http://localhost:8080

# API路径前缀（使用Go版统一API）
VMQ_API_URL=/api/

# 其他配置
VITE_WITH_CREDENTIALS=false
```

### 开发代理配置

```typescript
// vite.config.ts 中的代理配置
proxy: {
  '/api': {
    target: 'http://localhost:8080',  // Go后端服务地址
    changeOrigin: true,
  }
}
```

## 🌟 核心功能特性

### 多用户支付系统
- **用户注册登录** - 支持新用户注册和多用户登录
- **数据隔离** - 每个用户的订单、收款码、配置完全隔离
- **权限控制** - 基于用户身份的精细化权限管理
- **独立配置** - 每个用户可独立配置支付参数和收款码

### 高性能Go API
- **统一接口** - 所有API调用统一使用 `VmqGoService`
- **智能认证** - 支付页面公开访问，管理功能需要认证
- **类型安全** - 完整的TypeScript类型定义
- **错误处理** - 统一的错误处理和响应格式

### 支付页面系统
- **独立布局设计** - 支付页面采用独立布局，不显示管理菜单
- **自动状态检测** - 实时检测支付状态，自动更新页面
- **智能跳转** - 支付成功后自动生成带签名的回调URL并跳转
- **移动端优化** - 专门优化的移动端支付体验

### 订单管理系统（多用户版）
- **用户隔离** - 每个用户只能查看自己的订单
- **实时监控** - 支持订单状态实时更新
- **批量操作** - 支持批量关闭超时订单、删除过期订单
- **高级筛选** - 多维度订单筛选和搜索
- **数据导出** - 支持订单数据导出功能

### 收款码管理（多用户版）
- **多平台支持** - 统一管理微信、支付宝收款码
- **用户隔离** - 每个用户独立管理自己的收款码
- **状态监控** - 实时监控收款码可用状态
- **智能轮询** - 自动轮询分配可用收款码
- **批量导入** - 支持批量导入收款码

## 部署指南

### 生产环境部署

1. **构建项目**

   ```bash
   # 安装依赖
   pnpm install

   # 构建生产版本
   pnpm build

   # 构建产物在 dist/ 目录
   ```

2. **配置环境变量** 

   创建 `.env.production` 文件：

   ```env
   # 生产环境配置
   VITE_VERSION=2.4.2.9
   VITE_PORT=3006
   VITE_BASE_URL=/

   # Go后端API地址（根据实际情况修改）
   VITE_API_URL=http://api.yourdomain.com:8080

   # API路径前缀
   VMQ_API_URL=/api/

   # 其他配置
   VITE_WITH_CREDENTIALS=false
   ```

3. **Nginx 配置**

   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       index index.html;
       root /path/to/vmqfox-frontend/dist;

       # 启用 gzip 压缩
       gzip on;
       gzip_vary on;
       gzip_min_length 1024;
       gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

       # 前端路由支持 (SPA)
       location / {
           try_files $uri $uri/ /index.html;
           add_header Cache-Control "no-cache, no-store, must-revalidate";
       }

       # 静态资源缓存
       location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|webp|woff|woff2|ttf|eot)$ {
           expires 1y;
           add_header Cache-Control "public, immutable";
           access_log off;
       }

       # Go后端API代理
       location /api/ {
           proxy_pass http://localhost:8080/api/;  # Go后端服务地址
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;

           # 处理跨域
           add_header Access-Control-Allow-Origin *;
           add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS, PUT, DELETE';
           add_header Access-Control-Allow-Headers 'DNT,X-Mx-ReqToken,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Authorization';

           if ($request_method = 'OPTIONS') {
               return 204;
           }
       }

       # 支付页面特殊处理
       location /payment/ {
           try_files $uri $uri/ /index.html;
           add_header Cache-Control "no-cache, no-store, must-revalidate";
       }

       # 用户注册页面
       location /register {
           try_files $uri $uri/ /index.html;
           add_header Cache-Control "no-cache, no-store, must-revalidate";
       }

       # 安全配置
       location ~ /\. {
           deny all;
       }
   }
   ```

## 开发指南

### 使用Go API服务

```typescript
import { VmqGoService, type UserInfo, type OrderInfo } from '@/api/vmqGoApi'

// 用户认证
const login = async (credentials) => {
  const result = await VmqGoService.login(credentials)
  return result
}

// 获取当前用户信息（多用户支持）
const getCurrentUser = async () => {
  const userInfo: UserInfo = await VmqGoService.getCurrentUser()
  return userInfo
}

// 获取用户订单列表（自动用户隔离）
const getOrders = async () => {
  const params = {
    page: 1,
    limit: 20,
    status: '1'
  }
  const result = await VmqGoService.getOrders(params)
  return result
}

// 创建支付订单
const createOrder = async (orderData) => {
  const result = await VmqGoService.createOrder(orderData)
  return result
}

// 获取支付页面订单信息（公开访问）
const getPaymentOrder = async (orderId: string) => {
  const orderInfo: OrderInfo = await VmqGoService.getOrder(orderId, { public: true })
  return orderInfo
}
```

### 多用户状态管理

```typescript
import { useUserStore } from '@/store/modules/user'

const userStore = useUserStore()

// 用户登录
await userStore.login({ username, password })

// 获取当前用户信息
const currentUser = userStore.userInfo

// 用户登出
await userStore.logout()

// 检查用户权限
const hasPermission = userStore.hasPermission('order:manage')
```

### 添加新功能页面

1. 在 `src/views/vmq/` 下创建功能目录
2. 在 `src/router/routes/vmqRoutes.ts` 中添加路由配置
3. 在菜单配置中添加对应菜单项（支持权限控制）
4. 使用 `VmqGoService` 进行API调用（自动用户隔离）

## 🎯 架构优势

### 与原版V免签的对比

| 特性 | 原版V免签 | V免签Fox多用户Go版 |
|------|-----------|-------------------|
| 技术栈 | jQuery + ThinkPHP 5.1 | Vue 3 + TypeScript + Go |
| 用户支持 | ❌ 单用户 | ✅ 多用户 + 数据隔离 |
| API性能 | PHP（中等） | Go（高性能10倍+） |
| 前端架构 | 传统服务端渲染 | 现代SPA + 组件化 |
| 类型安全 | ❌ 弱类型 | ✅ TypeScript强类型 |
| 移动端适配 | 基础适配 | 完美响应式设计 |
| 部署复杂度 | 高（PHP环境配置） | 低（单一Go二进制） |
| 维护成本 | 高 | 低 |

### 技术优势

- ✅ **高性能Go后端** - 并发处理能力强，内存占用低
- ✅ **完整类型安全** - TypeScript + Go强类型保证代码质量
- ✅ **现代化架构** - 前后端分离 + RESTful API设计
- ✅ **多用户支持** - 企业级多租户架构
- ✅ **易于维护** - 统一的API服务，清晰的代码结构
- ✅ **可扩展性强** - 组件化设计，便于功能扩展

## 浏览器兼容性

- ✅ Chrome >= 87
- ✅ Firefox >= 78
- ✅ Safari >= 14
- ✅ Edge >= 88
- ❌ IE (不支持)

## 版本说明

### V2.4.2.9 (当前版本) - 多用户Go版

- 🎉 **多用户系统** - 支持多商户独立管理
- 🚀 **Go高性能后端** - 完全迁移到Go语言API
- 💯 **API统一** - 100%使用VmqGoService，移除旧版API
- 🔐 **智能认证** - 条件认证中间件
- 📱 **移动端优化** - 完善的响应式设计
- 🛡️ **安全增强** - JWT认证 + 数据隔离

### API迁移成果

- ✅ **100%完成** - 所有前端功能切换到Go版API
- ✅ **遗留清理** - 完全移除ThinkPHP API调用
- ✅ **类型完善** - 完整的TypeScript类型定义
- ✅ **性能提升** - API响应速度提升10倍以上

## 许可证

MIT License - 详见 [LICENSE](./LICENSE) 文件

## 相关链接

- [Go后端项目](https://github.com/hulisang/vmqfox-api-go) - Go语言高性能API服务
- [PHP后端项目](https://github.com/hulisang/vmqfox-backend) - ThinkPHP 8 后端API服务（已迁移）
- [V免签原版](https://github.com/szvone/vmqphp) - 基于ThinkPHP 5.1的原版
- [监控端APK](https://github.com/szvone/VmqApk) - Android监控应用
- [art-design-pro](https://www.lingchen.kim/art-design-pro/docs/) - UI框架文档

## 免责声明

⚠️ **重要提示**

本项目仅供个人开发者学习和测试使用，请勿用于非法用途。商业使用请申请官方支付接口。使用本项目产生的任何法律责任由使用者自行承担。

## 技术支持

- 🐛 Bug反馈：请提交 [Issues](../../issues)
- 💬 技术交流：欢迎参与项目讨论
- 📧 联系我们：如有问题请联系开发团队
- 📚 API文档：查看 `API_MIGRATION_COMPLETE.md` 了解详细API信息

---

**V免签Fox多用户Go版** - 为现代化支付系统而生，让个人开发者和企业的收款更简单、更安全、更高效！
