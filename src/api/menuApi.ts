import { VmqGoService } from './vmqGoApi'
import { menuDataToRouter } from '@/router/utils/menuToRouter'
import { AppRouteRecord } from '@/types/router'

interface MenuResponse {
  menuList: AppRouteRecord[]
}

// 菜单接口 - 直接使用Go API
export const menuService = {
  async getMenuList(delay = 300): Promise<MenuResponse> {
    try {
      // 直接从Go API获取动态菜单数据
      const menuData = await VmqGoService.getMenu()

      // 将Go API返回的菜单数据转换为前端路由格式
      const menuList = menuData.map((item: any) => {
        const route: AppRouteRecord = {
          id: item.id,
          name: item.name,
          path: item.path,
          component: item.component,
          meta: {
            title: item.meta.title,
            icon: item.meta.icon,
            roles: ['admin', 'super_admin'] // 从API获取的菜单都需要管理员权限
          },
          children: item.children || []
        }
        return menuDataToRouter(route)
      })

      // 模拟接口延迟
      await new Promise((resolve) => setTimeout(resolve, delay))

      return { menuList }
    } catch (error) {
      throw error instanceof Error ? error : new Error('获取菜单失败')
    }
  }
}
