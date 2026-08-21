import api from '@/utils/http'

export interface OrderInfo {
  payId: string
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
}

export interface OrderCheckResponse {
  state?: number
  remainingSeconds?: number
}

export interface ReturnUrlResponse {
  returnUrl: string
}

export class PaymentService {
  /**
   * 获取公开订单信息；路径参数是 bearer token，不是内部订单号。
   */
  static async getOrder(publicToken: string): Promise<OrderInfo> {
    return api.get<OrderInfo>({
      url: `/api/order/get/${encodeURIComponent(publicToken)}`,
      showErrorMessage: false
    })
  }

  /**
   * 检查公开订单状态；服务端只返回状态与剩余时间，不下发未经验证的回跳地址。
   */
  static async checkOrder(publicToken: string): Promise<OrderCheckResponse> {
    return api.get<OrderCheckResponse>({
      url: `/api/order/check/${encodeURIComponent(publicToken)}`,
      method: 'GET',
      showErrorMessage: false
    })
  }

  /**
   * 获取二维码图片 URL。
   */
  static getQrCodeUrl(url: string) {
    return `/api/qrcode/generate?url=${encodeURIComponent(url)}`
  }

  /**
   * 获取服务端验证过的带签名回跳 URL。
   */
  static async getReturnUrl(publicToken: string): Promise<ReturnUrlResponse> {
    return api.get<ReturnUrlResponse>({
      url: `/api/order/return-url/${encodeURIComponent(publicToken)}`,
      showErrorMessage: false
    })
  }
}
