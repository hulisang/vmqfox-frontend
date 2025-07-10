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
   * 获取订单信息
   */
  static async getOrder(orderId: string): Promise<OrderInfo> {
    try {
      // api.get会自动提取响应中的data.data字段作为返回值
      const orderInfo = await api.get<OrderInfo>({
        url: `/api/order/get/${orderId}`,
        showErrorMessage: false // 禁止自动显示错误消息，由组件自行处理
      })
      return orderInfo
    } catch (error) {
      throw error
    }
  }
  
  /**
   * 检查订单状态
   */
  static async checkOrder(orderId: string): Promise<OrderCheckResponse> {
    return api.get<OrderCheckResponse>({
      url: `/api/order/check/${orderId}`,
      method: 'GET',
      showErrorMessage: false // 禁止自动显示错误消息，由组件自行处理
    })
  }
  
  /**
   * 获取二维码图片URL
   */
  static getQrCodeUrl(url: string) {
    return `/api/qrcode/generate?url=${encodeURIComponent(url)}`
  }
  
  /**
   * 获取带签名的返回URL
   */
  static async getReturnUrl(orderId: string): Promise<ReturnUrlResponse> {
    return api.get<ReturnUrlResponse>({
      url: `/api/order/return-url/${orderId}`,
      showErrorMessage: false // 禁止自动显示错误消息，由组件自行处理
    })
  }
} 