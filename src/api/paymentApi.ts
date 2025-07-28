import api from '@/utils/http'
import { ApiResponse } from '@/typings/api'

export interface OrderInfo {
  payId: string
  orderId: string
  payType: number
  price: number
  reallyPrice: number
  payUrl: string
  isAuto: number
  state: number
  stateText?: string
  timeOut: number
  date: number
  remainingSeconds?: number
  return_url?: string
  param?: string
}

// 定义订单检查响应接口
export interface OrderCheckResponse {
  state?: number
  redirectUrl?: string
  remainingSeconds?: number
  return_url?: string
  param?: string
}

// 定义返回URL响应接口
export interface ReturnUrlResponse {
  returnUrl: string
  sign: string
}



export class PaymentService {
  /**
   * 获取订单信息（使用统一的Go API）
   */
  static async getOrder(orderId: string): Promise<OrderInfo> {
    try {
      // 使用新的统一API，支付页面无需认证，通过public参数标识
      const orderInfo = await api.get<OrderInfo>({
        url: `/api/v2/orders/${orderId}?public=true`,
        showErrorMessage: false // 禁止自动显示错误消息，由组件自行处理
      })
      return orderInfo
    } catch (error) {
      throw error
    }
  }

  /**
   * 检查订单状态（使用统一的Go API）
   */
  static async checkOrder(orderId: string): Promise<OrderCheckResponse> {
    return api.get<OrderCheckResponse>({
      url: `/api/v2/orders/${orderId}/status?public=true`,
      method: 'GET',
      showErrorMessage: false // 禁止自动显示错误消息，由组件自行处理
    })
  }

  /**
   * 获取二维码图片URL
   */
  static getQrCodeUrl(url: string) {
    // 使用Go API的v2二维码生成端点
    return `/api/v2/qrcode/generate?url=${encodeURIComponent(url)}`
  }
  
  /**
   * 获取带签名的返回URL
   */
  static async getReturnUrl(orderId: string): Promise<ReturnUrlResponse> {
    return api.get<ReturnUrlResponse>({
      url: `/api/public/orders/${orderId}/return-url`,
      showErrorMessage: false // 禁止自动显示错误消息，由组件自行处理
    })
  }
} 