import { AppRouteRecord } from '@/types/router'

/**
 * V免签菜单配置
 * 完全遵循 art-design-pro 的组件路径映射机制。
 * component 字段提供的是一个路径字符串，由框架的 registerRoutes.ts 负责动态加载。
 */
export const vmqRoutes: AppRouteRecord[] = [
  {
    path: '/dashboard',
    name: 'VmqDashboard',
    component: '/vmq/dashboard/index',
    meta: {
      title: '首页',
      icon: '&#xe6cc;',
      roles: ['admin'],
      fixedTab: true,
    },
  },
  {
    path: '/systemSettings',
    name: 'SystemSettings',
    component: '/vmq/systemSettings/index',
    meta: {
      title: '系统设置',
      icon: '&#xe6d0;',
      roles: ['admin'],
    },
  },
  {
    path: '/monitorSettings',
    name: 'Monitor',
    component: '/vmq/monitorSettings/index',
    meta: {
      title: '监控端状态',
      icon: '&#xe81d;',
      roles: ['admin']
    },
  },
  {
    path: '/wxqrcode',
    name: 'Wechat',
    meta: {
      title: '微信二维码',
      icon: '&#xe7c1;',
      roles: ['admin'],
      alwaysShow: true,
    },
    children: [
      {
        path: 'add',
        name: 'AddWechatQrcode',
        component: '/vmq/wxqrcode/add/index',
        meta: {
          title: '添加',
          icon: '&#xe717;',
          roles: ['admin'],
          inLayout: true,
        },
      },
      {
        path: 'manage',
        name: 'ManageWechatQrcode',
        component: '/vmq/wxqrcode/manage/index',
        meta: {
          title: '管理',
          icon: '&#xe7ba;',
          roles: ['admin'],
          inLayout: true,
        },
      },
    ]
  },
  {
    path: '/zfbqrcode',
    name: 'Alipay',
    meta: {
      title: '支付宝二维码',
      icon: '&#xe843;',
      roles: ['admin'],
      alwaysShow: true,
    },
    children: [
      {
        path: 'add',
        name: 'AddAlipayQrcode',
        component: '/vmq/zfbqrcode/add/index',
        meta: {
          title: '添加',
          icon: '&#xe717;',
          roles: ['admin'],
          inLayout: true,
        },
      },
      {
        path: 'manage',
        name: 'ManageAlipayQrcode',
        component: '/vmq/zfbqrcode/manage/index',
        meta: {
          title: '管理',
          icon: '&#xe7ba;',
          roles: ['admin'],
          inLayout: true,
        },
      },
    ]
  },
  {
    path: '/orderlist',
    name: 'OrderList',
    component: '/vmq/orderlist/index',
    meta: {
      title: '订单列表',
      icon: '&#xe76c;',
      roles: ['admin']
    },
  },
  {
    path: '/api',
    name: 'ApiDoc',
    component: '/vmq/api/index',
    meta: {
      title: 'Api说明',
      icon: '&#xe654;',
      roles: ['admin']
    },
  },
  // 支付相关路由，这些路由不会显示在菜单中
  {
    path: '/payment/:orderId',
    name: 'VmqPayment',
    component: '/vmq/payment/PaymentPage',
    meta: {
      title: '扫码支付',
      noAuth: true, // 不需要登录授权
      hideInMenu: true, // 在菜单中隐藏
      layout: false  // 或使用专门的支付布局
    },
  },
  {
    path: '/payment/result/:orderId',
    name: 'VmqPaymentResult',
    component: '/vmq/payment/PaymentResult',
    meta: {
      title: '支付结果',
      noAuth: true, // 不需要登录授权
      hideInMenu: true, // 在菜单中隐藏
      layout: false  // 或使用专门的支付布局
    },
  }
] 