# V免签Fox二开版 - 前端管理系统

## 项目简介

**V免签Fox二开版** 是基于原版V免签进行现代化改造的前后端分离支付系统前端部分。采用最新的 Vue 3 + TypeScript + art-design-pro 技术栈，为个人开发者提供美观、易用的免签支付管理界面。

> 本项目是V免签的二次开发版本，专注于提升用户体验和系统稳定性，同时保持原有的核心功能特性。

## 核心特色

### 💰 免签支付核心
- 🔄 **实时支付监控** - 支持微信/支付宝收款码实时监控
- 📱 **移动端适配** - 完美支持手机端支付页面
- 🎯 **自动回调** - 支付成功后自动跳转回商户网站
- 📊 **订单管理** - 完整的订单生命周期管理
- 🔐 **安全验证** - 支持签名验证和防重放攻击

### 🎨 现代化界面
- 🌈 **art-design-pro 设计** - 基于Element Plus的现代化管理界面
- 🌓 **主题切换** - 支持亮色/暗色主题无缝切换
- 📱 **响应式布局** - 完美适配桌面端和移动端
- 🎯 **独立支付页面** - 专门设计的支付页面，无管理菜单干扰
- 🎭 **个性化定制** - 支持多种主题和布局配置

### 🛠️ 管理功能
- 📋 **订单列表** - 支持筛选、搜索、批量操作
- 💳 **收款码管理** - 微信/支付宝收款码统一管理
- 📈 **数据统计** - 收款数据可视化图表展示
- ⚙️ **系统设置** - 灵活的系统参数配置
- 👥 **权限管理** - 基于角色的访问控制

## 技术架构

### 核心技术栈
- **Vue 3.5** - 渐进式JavaScript框架
- **TypeScript** - 类型安全的JavaScript超集
- **Vite 6** - 下一代前端构建工具
- **Element Plus** - 基于Vue 3的组件库
- **art-design-pro** - 企业级中后台前端解决方案

### 开发工具链
- **ESLint** - 代码质量检查
- **Prettier** - 代码格式化
- **Stylelint** - CSS代码检查
- **Husky** - Git钩子管理
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
│   │   ├── vmqApi.ts          # V免签核心API
│   │   └── paymentApi.ts      # 支付相关API
│   ├── views/
│   │   ├── vmq/               # V免签功能模块
│   │   │   ├── payment/       # 支付页面（独立布局）
│   │   │   │   ├── PaymentPage.vue      # 扫码支付页面
│   │   │   │   ├── PaymentResult.vue    # 支付结果页面
│   │   │   │   └── PaymentLayout.vue    # 支付页面布局
│   │   │   ├── orderlist/     # 订单管理
│   │   │   ├── wxqrcode/      # 微信收款码管理
│   │   │   ├── zfbqrcode/     # 支付宝收款码管理
│   │   │   ├── dashboard/     # 数据看板
│   │   │   └── settings/      # 系统设置
│   │   └── index/             # 主布局框架
│   ├── components/            # 公共组件
│   ├── router/               # 路由配置
│   │   ├── routes/
│   │   │   ├── staticRoutes.ts    # 静态路由（支付页面）
│   │   │   └── vmqRoutes.ts       # V免签功能路由
│   ├── store/                # 状态管理
│   └── assets/               # 静态资源
├── public/                   # 公共资源
└── package.json             # 项目配置
```

## 快速开始

### 环境要求
- Node.js >= 16.0.0
- pnpm >= 7.0.0 (推荐) 或 npm >= 8.0.0

### 安装依赖
```bash
# 推荐使用 pnpm
pnpm install

# 或使用 npm
npm install

# 如果安装失败，尝试清除缓存
pnpm install --ignore-scripts
```

### 开发环境
```bash
# 启动开发服务器
pnpm dev

# 访问地址
# 管理后台：http://localhost:3000
# 支付页面：http://localhost:3000/payment/:orderId
```

### 生产构建
```bash
# 构建生产版本
pnpm build

# 预览构建结果
pnpm serve
```

### 代码规范
```bash
# 代码检查
pnpm lint

# 自动修复
pnpm fix

# 格式化代码
pnpm lint:prettier

# CSS检查
pnpm lint:stylelint
```

## 配置说明

### 环境变量配置
创建 `.env.local` 文件：
```env
# 应用基本配置
VITE_VERSION=2.0.0
VITE_PORT=3000
VITE_BASE_URL=/

# 后端API地址
VITE_API_URL=http://localhost:8000

# 其他配置
VITE_WITH_CREDENTIALS=false
```

### 开发代理配置
```typescript
// vite.config.ts 中的代理配置
proxy: {
  '/api': {
    target: 'http://localhost:8000',
    changeOrigin: true,
  },
  // 兼容旧版API
  '^/(appHeart|appPush|createOrder|checkOrder|getOrder)': {
    target: 'http://localhost:8000',
    changeOrigin: true,
  }
}
```

## 核心功能

### 支付页面系统
- **独立布局设计** - 支付页面采用独立布局，不显示管理菜单
- **自动状态检测** - 实时检测支付状态，自动更新页面
- **智能跳转** - 支付成功后自动生成带签名的回调URL并跳转
- **移动端优化** - 专门优化的移动端支付体验

### 订单管理系统
- **实时订单监控** - 支持订单状态实时更新
- **批量操作** - 支持批量关闭超时订单、删除过期订单
- **高级筛选** - 多维度订单筛选和搜索
- **数据导出** - 支持订单数据导出功能

### 收款码管理
- **多平台支持** - 统一管理微信、支付宝收款码
- **状态监控** - 实时监控收款码可用状态
- **智能轮询** - 自动轮询分配可用收款码
- **批量导入** - 支持批量导入收款码

## 部署指南

### Nginx 配置
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    root /path/to/frontend/dist;
    index index.html;
    
    # 前端路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API代理到后端
    location /api/ {
        proxy_pass http://backend-server:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # 支付页面特殊处理
    location /payment/ {
        try_files $uri $uri/ /index.html;
        # 可以添加特殊的缓存策略
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
}
```

### Docker 部署
```dockerfile
# Dockerfile
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 开发指南

### 添加新功能页面
1. 在 `src/views/vmq/` 下创建功能目录
2. 在 `src/router/routes/vmqRoutes.ts` 中添加路由配置
3. 在菜单配置中添加对应菜单项

### API接口调用
```typescript
import { VmqService } from '@/api/vmqApi'

// 获取订单列表
const getOrders = async () => {
  const params = {
    page: 1,
    limit: 20,
    status: 1
  }
  const result = await VmqService.getOrderList(params)
  return result
}

// 创建支付订单
const createOrder = async (orderData) => {
  const result = await VmqService.createOrder(orderData)
  return result
}
```

### 状态管理使用
```typescript
import { useVmqStore } from '@/store/modules/vmq'

const vmqStore = useVmqStore()

// 更新订单列表
vmqStore.updateOrderList()

// 获取系统配置
const config = vmqStore.systemConfig
```

## 浏览器兼容性

- ✅ Chrome >= 87
- ✅ Firefox >= 78  
- ✅ Safari >= 14
- ✅ Edge >= 88
- ❌ IE (不支持)

## 版本说明

### V2.0.0 (当前版本)
- 🎉 全新的 art-design-pro 界面设计
- 🚀 升级到 Vue 3 + TypeScript
- 💰 优化支付页面用户体验
- 🔧 重构订单管理系统
- 📱 完善移动端适配

### 与原版V免签的区别
- ✅ **现代化技术栈** - 从jQuery升级到Vue 3
- ✅ **前后端分离** - 独立的前端项目
- ✅ **TypeScript支持** - 更好的类型安全
- ✅ **组件化开发** - 可复用的组件系统
- ✅ **响应式设计** - 更好的移动端体验

## 许可证

MIT License - 详见 [LICENSE](./LICENSE) 文件

## 相关链接

- [后端项目](../backend/) - ThinkPHP 8 后端API服务
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

---

**V免签Fox** - 让个人开发者的收款更简单、更安全、更现代化！
