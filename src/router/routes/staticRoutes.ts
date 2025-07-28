import { AppRouteRecordRaw } from '../utils/utils'
import { RoutesAlias } from '../routesAlias'

/**
 * 静态路由配置
 * 不需要权限就能访问的路由
 */
export const staticRoutes: AppRouteRecordRaw[] = [
  {
    path: RoutesAlias.Login,
    name: 'Login',
    component: () => import('@views/auth/login/index.vue'),
    meta: { title: 'menus.login.title', isHideTab: true, setTheme: true }
  },
  {
    path: RoutesAlias.Register,
    name: 'Register',
    component: () => import('@views/auth/register/index.vue'),
    meta: { title: 'menus.register.title', isHideTab: true, noLogin: true, setTheme: true }
  },
  {
    path: RoutesAlias.ForgetPassword,
    name: 'ForgetPassword',
    component: () => import('@views/auth/forget-password/index.vue'),
    meta: { title: 'menus.forgetPassword.title', isHideTab: true, noLogin: true, setTheme: true }
  },
  // 支付页面路由 - 完全独立于后台管理
  {
    path: '/payment',
    component: () => import('@/views/vmq/payment/PaymentLayout.vue'),
    meta: { 
      noLogin: true, 
      noAuth: true
    },
    children: [
      {
        path: ':orderId',
        name: 'Payment',
        component: () => import('@/views/vmq/payment/PaymentPage.vue'),
        meta: { 
          title: '扫码支付'
        }
      },
      {
        path: 'result/:orderId',
        name: 'PaymentResult',
        component: () => import('@/views/vmq/payment/PaymentResult.vue'),
        meta: { 
          title: '支付结果'
        }
      }
    ]
  },
  {
    path: '/exception',
    component: () => import('@views/index/index.vue'),
    name: 'Exception',
    meta: { title: 'menus.exception.title' },
    children: [
      {
        path: RoutesAlias.Exception403,
        name: 'Exception403',
        component: () => import('@views/exception/403/index.vue'),
        meta: { title: '403' }
      },
      {
        path: '/:catchAll(.*)',
        name: 'Exception404',
        component: () => import('@views/exception/404/index.vue'),
        meta: { title: '404' }
      },
      {
        path: RoutesAlias.Exception500,
        name: 'Exception500',
        component: () => import('@views/exception/500/index.vue'),
        meta: { title: '500' }
      }
    ]
  },
  // 调试和测试页面 - 静态路由，无需权限
  {
    path: '/debug',
    component: () => import('@views/index/index.vue'),
    name: 'Debug',
    meta: { title: '调试页面' },
    children: [
      {
        path: '/userDebug',
        name: 'UserDebug',
        component: () => import('@/views/system/user/debug.vue'),
        meta: { title: '用户管理调试' }
      }
    ]
  },
  {
    path: '/outside',
    component: () => import('@views/index/index.vue'),
    name: 'Outside',
    meta: { title: 'menus.outside.title' },
    children: [
      {
        path: '/outside/iframe/:path',
        name: 'Iframe',
        component: () => import('@/views/outside/Iframe.vue'),
        meta: { title: 'iframe' }
      }
    ]
  }
]
