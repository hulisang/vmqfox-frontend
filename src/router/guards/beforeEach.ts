import type { Router, RouteLocationNormalized, NavigationGuardNext } from 'vue-router'
import NProgress from 'nprogress'
import { useSettingStore } from '@/store/modules/setting'
import { useUserStore } from '@/store/modules/user'
import { useMenuStore } from '@/store/modules/menu'
import { setWorktab } from '@/utils/navigation'
import { setPageTitle, setSystemTheme } from '../utils/utils'
import { menuService } from '@/api/menuApi'
import { registerDynamicRoutes } from '../utils/registerRoutes'
import { AppRouteRecord } from '@/types/router'
import { RoutesAlias } from '../routesAlias'
import { menuDataToRouter } from '../utils/menuToRouter'
import { asyncRoutes } from '../routes/asyncRoutes'
import { loadingService } from '@/utils/ui'
import { useCommon } from '@/composables/useCommon'
import { useWorktabStore } from '@/store/modules/worktab'
import { vmqRoutes } from '../routes/vmqRoutes'

// 是否已注册动态路由
const isRouteRegistered = ref(false)

/**
 * 路由全局前置守卫
 * 处理进度条、获取菜单列表、动态路由注册、404 检查、工作标签页及页面标题设置
 */
export function setupBeforeEachGuard(router: Router): void {
  router.beforeEach(
    async (
      to: RouteLocationNormalized,
      from: RouteLocationNormalized,
      next: NavigationGuardNext
    ) => {
      try {
        await handleRouteGuard(to, from, next, router)
      } catch (error) {
        console.error('路由守卫处理失败:', error)
        next('/exception/500')
      }
    }
  )
}

/**
 * 处理路由守卫逻辑
 */
async function handleRouteGuard(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
  router: Router
): Promise<void> {
  const settingStore = useSettingStore()
  const userStore = useUserStore()

  // 处理进度条
  if (settingStore.showNprogress) {
    NProgress.start()
  }

  // 设置系统主题
  setSystemTheme(to)

  // 处理登录状态
  if (!(await handleLoginStatus(to, userStore, next))) {
    return
  }

  // 处理动态路由注册
  if (!isRouteRegistered.value && userStore.isLogin) {
    await handleDynamicRoutes(to, router, next)
    return
  }

  // 处理根路径跳转到首页
  if (userStore.isLogin && isRouteRegistered.value && handleRootPathRedirect(to, next)) {
    return
  }

  // 处理已知的匹配路由
  if (to.matched.length > 0) {
    setWorktab(to)
    setPageTitle(to)
    next()
    return
  }

  // 尝试刷新路由重新注册
  if (userStore.isLogin) {
    isRouteRegistered.value = false
    await handleDynamicRoutes(to, router, next)
    return
  }

  // 如果以上都不匹配，跳转到404
  next(RoutesAlias.Exception404)
}

/**
 * 处理登录状态
 */
async function handleLoginStatus(
  to: RouteLocationNormalized,
  userStore: ReturnType<typeof useUserStore>,
  next: NavigationGuardNext
): Promise<boolean> {
  if (!userStore.isLogin && to.path !== RoutesAlias.Login && !to.meta.noLogin) {
    userStore.logOut()
    next(RoutesAlias.Login)
    return false
  }
  return true
}

/**
 * 处理动态路由注册
 */
async function handleDynamicRoutes(
  to: RouteLocationNormalized,
  router: Router,
  next: NavigationGuardNext
): Promise<void> {
  try {
    await getMenuData(router)

    // 跳转到菜单的第一个有效路由（仅在非刷新情况下）
    if (handleRootPathRedirect(to, next)) {
      return
    }

    next({
      path: to.path,
      query: to.query,
      hash: to.hash,
      replace: true
    })
  } catch (error) {
    console.error('动态路由注册失败:', error)
    next('/exception/500')
  }
}

/**
 * 获取菜单数据
 * @param router 路由实例
 */
async function getMenuData(router: Router): Promise<void> {
  try {
    // 强制使用V免签的前端菜单逻辑
    await processVmqMenu(router)
  } catch (error) {
    handleMenuError(error)
  }
}

/**
 * 处理V免签前端控制模式的菜单逻辑
 */
async function processVmqMenu(router: Router): Promise<void> {
  const closeLoading = loadingService.showLoading()
  
  // 使用我们定义的V免签菜单
  const menuList = vmqRoutes.map((route) => menuDataToRouter(route))
  
  // 设置模拟的用户信息，确保有 'admin' 角色
  const userStore = useUserStore()
  if (!userStore.info.roles || userStore.info.roles.length === 0) {
    userStore.setUserInfo({
      userId: 1,
      userName: 'admin',
      avatar: '',
      roles: ['admin'],
      buttons: [],
    })
  }

  const roles = userStore.info.roles
  if (!roles) {
    closeLoading()
    throw new Error('获取用户角色失败')
  }

  const filteredMenuList = filterMenuByRoles(menuList, roles)
  await new Promise((resolve) => setTimeout(resolve, 300))
  await registerAndStoreMenu(router, filteredMenuList, closeLoading)
}

/**
 * 处理前端控制模式的菜单逻辑
 */
async function processFrontendMenu(router: Router): Promise<void> {
  const closeLoading = loadingService.showLoading()
  const menuList = asyncRoutes.map((route) => menuDataToRouter(route))
  const userStore = useUserStore()
  const roles = userStore.info.roles

  if (!roles) {
    closeLoading()
    throw new Error('获取用户角色失败')
  }

  const filteredMenuList = filterMenuByRoles(menuList, roles)
  await new Promise((resolve) => setTimeout(resolve, 300))
  await registerAndStoreMenu(router, filteredMenuList, closeLoading)
}

/**
 * 处理后端控制模式的菜单逻辑
 */
async function processBackendMenu(router: Router): Promise<void> {
  const closeLoading = loadingService.showLoading()
  const { menuList } = await menuService.getMenuList()
  await registerAndStoreMenu(router, menuList, closeLoading)
}

/**
 * 注册路由并存储菜单数据
 */
async function registerAndStoreMenu(
  router: Router,
  menuList: AppRouteRecord[],
  closeLoading: () => void
): Promise<void> {
  if (!isValidMenuList(menuList)) {
    closeLoading()
    throw new Error('获取菜单列表失败，请重新登录')
  }

  const menuStore = useMenuStore()
  menuStore.setMenuList(menuList)
  registerDynamicRoutes(router, menuList)
  isRouteRegistered.value = true
  useWorktabStore().validateWorktabs(router)
  closeLoading()
}

/**
 * 处理菜单相关错误
 */
function handleMenuError(error: unknown): void {
  console.error('菜单处理失败:', error)
  useUserStore().logOut()
  throw error instanceof Error ? error : new Error('获取菜单列表失败，请重新登录')
}

/**
 * 根据角色过滤菜单
 */
const filterMenuByRoles = (menu: AppRouteRecord[], roles: string[]): AppRouteRecord[] => {
  return menu.reduce((acc: AppRouteRecord[], item) => {
    const itemRoles = item.meta?.roles
    const hasPermission = !itemRoles || itemRoles.some((role) => roles?.includes(role))

    if (hasPermission) {
      const filteredItem = { ...item }
      if (filteredItem.children?.length) {
        filteredItem.children = filterMenuByRoles(filteredItem.children, roles)
      }
      acc.push(filteredItem)
    }

    return acc
  }, [])
}

/**
 * 验证菜单列表是否有效
 */
function isValidMenuList(menuList: AppRouteRecord[]): boolean {
  return Array.isArray(menuList) && menuList.length > 0
}

/**
 * 重置路由相关状态
 * 通过调用存储的移除函数来精确清除动态路由
 */
export function resetRouterState(): void {
  isRouteRegistered.value = false

  // 通过调用存储的移除函数来清除动态路由
  const menuStore = useMenuStore()
  menuStore.removeAllDynamicRoutes()

  // 清空菜单数据
  menuStore.setMenuList([])
}

/**
 * 处理根路径跳转到首页
 * @param to 目标路由
 * @param next 路由跳转函数
 * @returns 是否处理了跳转
 */
function handleRootPathRedirect(to: RouteLocationNormalized, next: NavigationGuardNext): boolean {
  if (to.path === '/') {
    const { homePath } = useCommon()
    if (homePath.value) {
      next({ path: homePath.value, replace: true })
      return true
    }
  }
  return false
}
