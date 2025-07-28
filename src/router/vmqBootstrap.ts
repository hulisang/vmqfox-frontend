import type { Router } from 'vue-router'
import { vmqRoutes } from './routes/vmqRoutes'
import { useUserStore } from '@/store/modules/user'
import { useMenuStore } from '@/store/modules/menu'
import { registerDynamicRoutes } from './utils/registerRoutes'
import { AppRouteRecord } from '@/types/router'

/**
 * 初始化V免签菜单路由
 * @param router 路由实例
 */
export async function initVmqRoutes(router: Router): Promise<void> {
  // 设置用户为管理员角色
  const userStore = useUserStore()
  userStore.setUserInfo({
    id: 1,
    userId: 1,
    username: 'admin',
    userName: 'admin',
    avatar: '',
    role: 'admin',
    roles: ['admin'],
    buttons: []
  })
  
  // 注册V免签菜单
  const menuStore = useMenuStore()
  menuStore.setMenuList(vmqRoutes as AppRouteRecord[])
  
  // 注册动态路由
  registerDynamicRoutes(router, vmqRoutes as AppRouteRecord[])
  
  return Promise.resolve()
}