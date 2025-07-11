/**
 * 路由相关工具函数
 */

import { AppRouteRecord } from '@/types'

// 检查是否为 iframe 路由
export function isIframe(url: string): boolean {
  return url.startsWith('/outside/iframe/')
}

/**
 * 验证菜单项是否有效
 * @param menuItem 菜单项
 * @returns 是否为有效菜单项
 */
const isValidMenuItem = (menuItem: AppRouteRecord): boolean => {
  return !!(menuItem.path && menuItem.path.trim() && !menuItem.meta?.isHide)
}

/**
 * 标准化路径格式
 * @param path 路径
 * @returns 标准化后的路径
 */
const normalizePath = (path: string): string => {
  return path.startsWith('/') ? path : `/${path}`
}

/**
 * 递归获取菜单的第一个有效路径
 * @param menuList 菜单列表
 * @returns 第一个有效路径，如果没有找到则返回空字符串
 */
export const getFirstMenuPath = (menuList: AppRouteRecord[]): string => {
  let homePath = ''

  const findPath = (data: AppRouteRecord[], parentPath = '') => {
    for (const item of data) {
      if (!isValidMenuItem(item)) {
        continue
      }
      // 拼接完整路径，处理斜杠
      const currentPath = item.path.startsWith('/') ? item.path : `${parentPath}/${item.path}`.replace(/\/+/g, '/')

      if (item.children?.length) {
        findPath(item.children, currentPath)
      } else {
        if (!homePath) {
          homePath = currentPath
        }
      }
    }
  }

  findPath(menuList)
  return homePath
}
