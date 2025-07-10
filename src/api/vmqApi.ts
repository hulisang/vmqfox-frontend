import api from '@/utils/http'
import { ApiResponse } from '@/typings/api'
import { useUserStore } from '@/store/modules/user'

// 设置 VMQ API 基础 URL
// const VITE_VMQ_API_URL = import.meta.env.VITE_VMQ_API_URL
// api.defaults.baseURL = VITE_VMQ_API_URL

// 二维码查询参数接口
interface QrcodeParams {
  page?: number
  limit?: number
}

// 二维码项接口
interface QrcodeItem {
  id: number
  price: number
  pay_url: string
  state: number
  state_text?: string
  create_date?: string
}

// 二维码响应接口
interface QrcodeResponse {
  total?: number
  items?: QrcodeItem[]
  data?: QrcodeItem[] | { total?: number; items?: QrcodeItem[] }
  [key: string]: any
}

/**
 * V免签API接口
 */
export class VmqService {
  /**
   * 登录接口
   * @param params 登录参数
   */
  static async login(params: { username: string; password: string }) {
    // http client的拦截器已经处理了code校验和错误抛出。
    // 如果这个await能成功执行完，说明API调用一定是成功的，
    // 并且responseData就是后端返回的JSON中的data字段。
    const responseData = await api.post<{ accessToken: string; username: string }>({
      url: `/api/auth/login`,
      data: {
        username: params.username,
        password: params.password,
      },
    });

    // 直接使用成功返回的数据构建结果
    return {
      accessToken: responseData.accessToken,
      refreshToken: '', // vmq系统没有刷新token机制
      message: '登录成功',
    };
  }
  
  /**
   * 获取菜单数据
   */
  static async getMenu() {
    return api.get<any>({
      url: `/api/menu`
    })
  }
  
  /**
   * 获取订单列表
   * @param params 查询参数
   */
  static async getOrders(params?: { page?: number; limit?: number; state?: number }) {
    return api.get<any>({
      url: `/api/order/list`,
      params
    })
  }
  
  /**
   * 获取微信二维码列表
   */
  static async getWxQrcodes(params: QrcodeParams) {
    return api.get<ApiResponse<QrcodeResponse | QrcodeItem[]>>({
      url: '/api/qrcode/wechat',
      params
    })
  }
  
  /**
   * 获取支付宝二维码列表
   */
  static async getZfbQrcodes(params: QrcodeParams) {
    return api.get<ApiResponse<QrcodeResponse | QrcodeItem[]>>({
      url: '/api/qrcode/alipay',
      params
    })
  }
  
  /**
   * 添加微信二维码
   */
  static async addWxQrcode(data: { price: number; pay_url: string }) {
    return api.post<ApiResponse<any>>({
      url: '/api/qrcode/wechat',
      data
    })
  }
  
  /**
   * 添加支付宝二维码
   */
  static async addZfbQrcode(data: { price: number; pay_url: string }) {
    return api.post<ApiResponse<any>>({
      url: '/api/qrcode/alipay',
      data
    })
  }
  
  /**
   * 删除微信二维码
   */
  static async delWxQrcode(id: number) {
    return api.del<ApiResponse<any>>({
      url: `/api/qrcode/wechat/${id}`
    })
  }
  
  /**
   * 删除支付宝二维码
   */
  static async delZfbQrcode(id: number) {
    return api.del<ApiResponse<any>>({
      url: `/api/qrcode/alipay/${id}`
    })
  }
  
  /**
   * 上传微信二维码图片
   */
  static async uploadWxQrcode(formData: FormData) {
    const { accessToken } = useUserStore()
    const headers: Record<string, string> = {}
    if (accessToken) {
      headers['Authorization'] = accessToken
    }

    // 使用 fetch API 发送请求，确保 FormData 被正确处理
    const response = await fetch(`/api/qrcode/parse`, {
      method: 'POST',
      headers,
      body: formData
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ msg: `HTTP 错误，状态码: ${response.status}` }))
      throw new Error(errorData.msg || '上传失败')
    }
    
    return response.json()
  }
  
  /**
   * 上传支付宝二维码图片
   */
  static async uploadZfbQrcode(formData: FormData) {
    return api.post<any>({
      url: `/api/qrcode/parse`,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
  
  /**
   * 解析二维码
   */
  static async parseQrcode(qrcodeData: string) {
    // 此方法已不再需要，因为我们现在直接上传文件
    // 保留此空方法或移除它都可以，为了安全起见，我们先注释掉其内容
    /*
    try {
      console.log('调用parseQrcode方法，数据长度:', qrcodeData.length)
      
      const formData = new FormData()
      
      const byteCharacters = atob(qrcodeData)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: 'image/png' })
      
      formData.append('file', blob, 'qrcode.png')
      
      const response = await api.post<any>({
        url: `/api/qrcode/parse`,
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      console.log('解析二维码API调用成功:', response)
      return response
    } catch (error) {
      console.error('解析二维码API调用失败:', error)
      throw error
    }
    */
    return Promise.resolve()
  }
  
  /**
   * 获取系统设置
   */
  static async getSettings() {
    return api.get<any>({
      url: `/api/config/settings`
    })
  }
  
  /**
   * 更新系统设置
   */
  static async updateSettings(params: any) {
    return api.post<any>({
      url: `/api/config/settings`,
      data: params
    })
  }
  
  /**
   * 获取监控端状态
   */
  static async getMonitorStatus() {
    return api.get<any>({
      url: `/api/config/monitor`
    })
  }
  
  /**
   * 设置监控端参数
   */
  static async saveMonitorSettings(params: any) {
    return api.post<any>({
      url: `/api/config/monitor`,
      data: params
    })
  }
  
  /**
   * 删除订单
   */
  static async deleteOrder(id: number) {
    return api.del<any>({
      url: `/api/order/${id}`
    })
  }
  
  /**
   * 删除过期订单
   */
  static async deleteExpiredOrders() {
    return api.del<any>({
      url: `/api/order/expired`
    })
  }
  
  /**
   * 删除历史订单
   */
  static async deleteLastOrders() {
    return api.del<any>({
      url: `/api/order/last`
    })
  }
  
  /**
   * 设置二维码状态（启用/禁用）
   * @param id 二维码ID
   * @param state 状态：0-启用，1-禁用
   */
  static async setQrcodeState(id: number, state: number) {
    return api.post<ApiResponse<any>>({
      url: `/api/qrcode/bind/${id}`,
      data: { state }
    })
  }
}

/**
 * 获取系统状态（统计数据）
 * @returns Promise
 */
export const getSystemStatus = () => {
  return api.get<any>({ url: '/api/config/status' })
}

/**
 * 获取系统配置（环境信息）
 * @returns Promise
 */
export const getSystemConfig = () => {
  return api.get<any>({ url: '/api/config/get' })
}

export type { QrcodeItem, QrcodeResponse } 