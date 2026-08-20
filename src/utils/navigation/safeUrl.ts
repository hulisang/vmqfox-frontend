/**
 * 外部跳转协议白名单
 *
 * 收银台回跳地址由商户配置、经后端下发，属于不可信输入；跳转前必须校验协议，
 * 阻断 `javascript:`、`data:`、`vbscript:` 等伪协议在支付成功页被执行。
 */

const ALLOWED_PROTOCOLS = ['http:', 'https:']

/** 相对路径按当前站点 origin 归一化，非法输入返回 null */
const parseUrl = (raw: string): URL | null => {
  const value = raw?.trim()
  if (!value) return null
  try {
    return new URL(value, window.location.origin)
  } catch {
    return null
  }
}

/** 返回可安全跳转的绝对地址；协议不合规时返回 null，由调用方决定降级行为 */
export const safeHttpUrl = (raw: string): string | null => {
  const url = parseUrl(raw)
  return url && ALLOWED_PROTOCOLS.includes(url.protocol) ? url.href : null
}

export const isSafeHttpUrl = (raw: string): boolean => safeHttpUrl(raw) !== null

/** 当前窗口跳转，返回是否实际发生跳转 */
export const navigateTo = (raw: string): boolean => {
  const target = safeHttpUrl(raw)
  if (!target) return false
  window.location.href = target
  return true
}

/** 新窗口打开，附带 noopener/noreferrer 阻断反向 tabnabbing */
export const openInNewTab = (raw: string): boolean => {
  const target = safeHttpUrl(raw)
  if (!target) return false
  window.open(target, '_blank', 'noopener,noreferrer')
  return true
}