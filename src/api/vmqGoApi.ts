import api from '@/utils/http'
import { ApiResponse } from '@/typings/api'

// Go后端API基础URL
const GO_API_BASE = '/api/v2'

// 用户信息类型定义
export interface UserInfo {
  id?: number;
  userId?: number;
  username?: string;
  userName?: string;
  email?: string;
  role?: string;
  roles?: string[];
  buttons?: string[];
  avatar?: string;
  phone?: string;
  created_at?: string;
}

/**
 * VMQFox Go后端API接口
 * 用于替换原有的ThinkPHP API
 */
export class VmqGoService {
  
  // ==================== 认证相关API ====================
  
  /**
   * 用户登录
   * @param params 登录参数
   */
  static async login(params: { username: string; password: string }) {
    const responseData = await api.post<{ 
      access_token: string; 
      refresh_token: string;
      user: {
        id: number;
        username: string;
        email: string;
        role: string;
      }
    }>({
      url: `${GO_API_BASE}/auth/login`,
      data: {
        username: params.username,
        password: params.password,
      },
    });

    return {
      accessToken: responseData.access_token,
      refreshToken: responseData.refresh_token,
      user: responseData.user,
      message: '登录成功',
    };
  }

  /**
   * 用户注册
   * @param params 注册参数
   */
  static async register(params: {
    username: string;
    email: string;
    password: string;
    confirm_password: string;
  }) {
    const responseData = await api.post<{
      message: string;
      user: {
        id: number;
        username: string;
        email: string;
        role: string;
      }
    }>({
      url: `${GO_API_BASE}/auth/register`,
      data: {
        username: params.username,
        email: params.email,
        password: params.password,
        confirm_password: params.confirm_password,
      },
    });

    return {
      message: responseData.message,
      user: responseData.user,
    };
  }

  /**
   * 刷新Token
   * @param refreshToken 刷新token
   */
  static async refreshToken(refreshToken: string) {
    return api.post<{ access_token: string; refresh_token: string }>({
      url: `${GO_API_BASE}/auth/refresh`,
      data: { refresh_token: refreshToken }
    });
  }

  /**
   * 获取当前用户信息
   */
  static async getCurrentUser() {
    return api.get<UserInfo>({
      url: `${GO_API_BASE}/me`
    });
  }



  /**
   * 用户登出
   */
  static async logout() {
    return api.post<any>({
      url: `${GO_API_BASE}/logout`
    });
  }

  // ==================== 用户管理API ====================

  /**
   * 获取用户列表
   */
  static async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }) {
    return api.get<{
      data: Array<{
        id: number;
        username: string;
        email: string;
        role: string;
        status: number;
        last_login_time: number;
        last_login_ip: string;
        created_at: number;
        updated_at: number;
      }>;
      meta: {
        page: number;
        limit: number;
        total: number;
        total_pages: number;
      };
    }>({
      url: `${GO_API_BASE}/users`,
      params
    });
  }

  /**
   * 创建用户
   */
  static async createUser(data: {
    username: string;
    email: string;
    password: string;
    role: string; // admin 或 super_admin
  }) {
    return api.post<{
      id: number;
      username: string;
      email: string;
      role: string;
      status: number;
      created_at: string;
    }>({
      url: `${GO_API_BASE}/users`,
      data
    });
  }

  /**
   * 更新用户
   */
  static async updateUser(id: number, data: {
    username?: string;
    email?: string;
    role?: string;
    status?: number;
  }) {
    return api.put<any>({
      url: `${GO_API_BASE}/users/${id}`,
      data
    });
  }

  /**
   * 删除用户
   */
  static async deleteUser(id: number) {
    return api.del<any>({
      url: `${GO_API_BASE}/users/${id}`
    });
  }

  /**
   * 重置用户密码
   */
  static async resetUserPassword(id: number, password: string) {
    return api.patch<any>({
      url: `${GO_API_BASE}/users/${id}/password`,
      data: { password }
    });
  }

  // ==================== 菜单管理API ====================
  
  /**
   * 获取菜单数据（支持权限隔离）
   */
  static async getMenu() {
    return api.get<Array<{
      id: number;
      name: string;
      path: string;
      icon: string;
      component: string;
      meta: {
        title: string;
        icon: string;
      };
      children?: Array<any>;
    }>>({
      url: `${GO_API_BASE}/menu`
    });
  }

  // ==================== 订单管理API ====================
  
  /**
   * 获取订单列表（管理后台）
   * @param params 查询参数
   */
  static async getOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
    user_id?: number;
  }) {
    return api.get<{
      data: Array<any>;
      meta: {
        total: number;
        page: number;
        limit: number;
        total_pages: number;
      };
    }>({
      url: `${GO_API_BASE}/orders`,
      params
    });
  }

  /**
   * 获取单个订单（管理后台）
   * @param id 订单ID
   */
  static async getOrder(id: number) {
    return api.get<any>({
      url: `${GO_API_BASE}/orders/${id}`
    });
  }

  /**
   * 创建订单（管理后台）
   * @param data 订单数据
   */
  static async createOrder(data: {
    type: string;
    price: number;
    subject: string;
    body?: string;
    notify_url?: string;
    return_url?: string;
  }) {
    return api.post<any>({
      url: `${GO_API_BASE}/orders`,
      data
    });
  }

  /**
   * 更新订单（管理后台）
   * @param id 订单ID
   * @param data 更新数据
   */
  static async updateOrder(id: number, data: any) {
    return api.put<any>({
      url: `${GO_API_BASE}/orders/${id}`,
      data
    });
  }

  /**
   * 删除订单（管理后台）
   * @param id 订单ID
   */
  static async deleteOrder(id: number) {
    return api.del<any>({
      url: `${GO_API_BASE}/orders/${id}`
    });
  }

  /**
   * 获取订单状态（管理后台）
   * @param id 订单ID
   */
  static async getOrderStatus(id: number) {
    return api.get<any>({
      url: `${GO_API_BASE}/orders/${id}/status`
    });
  }

  /**
   * 关闭订单（管理后台）
   * @param id 订单ID
   */
  static async closeOrder(id: number) {
    return api.put<any>({
      url: `${GO_API_BASE}/orders/${id}/close`
    });
  }

  /**
   * 关闭超时订单（管理后台）
   * @param params 关闭参数
   */
  static async closeExpiredOrders(params?: {
    user_id?: number;
    limit?: number;
  }) {
    return api.post<{
      closed_count: number;
    }>({
      url: `${GO_API_BASE}/orders/close-expired`,
      data: params || { limit: 100 } // 默认限制100条
    });
  }

  /**
   * 删除过期订单（管理后台）
   * @param params 删除参数
   */
  static async deleteExpiredOrders(params?: {
    user_id?: number;
    limit?: number;
    only_closed?: boolean;
    expire_days?: number;
  }) {
    return api.post<{
      deleted_count: number;
    }>({
      url: `${GO_API_BASE}/orders/delete-expired`,
      data: params || {
        limit: 100,        // 默认限制100条
        only_closed: true, // 默认只删除已关闭的订单
        expire_days: 30    // 默认删除30天前的订单
      }
    });
  }

  /**
   * 生成返回URL
   * @param id 订单ID
   */
  static async generateReturnURL(id: number) {
    return api.get<any>({
      url: `${GO_API_BASE}/orders/${id}/return-url`
    });
  }

  // ==================== 收款码管理API ====================
  
  /**
   * 获取收款码列表
   * @param params 查询参数
   */
  static async getQrcodes(params?: {
    page?: number;
    limit?: number;
    type?: number; // 1=微信, 2=支付宝
  }) {
    return api.get<{
      data: Array<{
        id: number;
        type: number; // 1=微信, 2=支付宝
        price: number;
        pay_url: string;
        status: string;
        created_at: string;
      }>;
      meta: {
        total: number;
        page: number;
        limit: number;
        total_pages: number;
      };
    }>({
      url: `${GO_API_BASE}/qrcodes`,
      params
    });
  }

  /**
   * 创建收款码
   * @param data 收款码数据
   */
  static async createQrcode(data: {
    type: number; // 1=微信, 2=支付宝
    price: number;
    pay_url: string;
  }) {
    return api.post<any>({
      url: `${GO_API_BASE}/qrcodes`,
      data
    });
  }

  /**
   * 删除收款码
   * @param id 收款码ID
   */
  static async deleteQrcode(id: number) {
    return api.del<any>({
      url: `${GO_API_BASE}/qrcodes/${id}`
    });
  }

  /**
   * 更新收款码状态
   * @param id 收款码ID
   * @param state 状态 (0=禁用, 1=启用)
   */
  static async updateQrcodeStatus(id: number, state: number) {
    return api.put<any>({
      url: `${GO_API_BASE}/qrcodes/${id}/status`,
      data: { state }
    });
  }

  /**
   * 解析收款码
   * @param formData 文件数据
   */
  static async parseQrcode(formData: FormData) {
    return api.post<any>({
      url: `${GO_API_BASE}/qrcodes/parse`,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }

  /**
   * 生成收款码图片
   * @param url 收款码URL
   */
  static getQrcodeImageUrl(url: string) {
    // 使用v2的二维码生成端点，无需认证
    return `/api/v2/qrcode/generate?url=${encodeURIComponent(url)}`;
  }

  // ==================== 系统配置API ====================
  
  /**
   * 获取系统配置
   */
  static async getSystemConfig() {
    return api.get<any>({
      url: `${GO_API_BASE}/settings`
    });
  }

  /**
   * 更新系统配置
   * @param data 配置数据
   */
  static async updateSystemConfig(data: any) {
    return api.post<any>({
      url: `${GO_API_BASE}/settings`,
      data
    });
  }

  /**
   * 获取监控配置
   */
  static async getMonitorConfig() {
    return api.get<any>({
      url: `${GO_API_BASE}/settings/monitor`
    });
  }

  /**
   * 更新监控配置
   * @param data 监控配置数据
   */
  static async updateMonitorConfig(data: any) {
    return api.put<any>({
      url: `${GO_API_BASE}/settings/monitor`,
      data
    });
  }

  /**
   * 获取系统状态
   */
  static async getSystemStatus() {
    return api.get<any>({
      url: `${GO_API_BASE}/system/status`
    });
  }

  /**
   * 获取全局系统状态（只有超级管理员可以访问）
   */
  static async getGlobalSystemStatus() {
    return api.get<any>({
      url: `${GO_API_BASE}/system/global-status`
    });
  }

  /**
   * 获取系统信息
   */
  static async getSystemInfo() {
    return api.get<any>({
      url: `${GO_API_BASE}/system/info`
    });
  }

  /**
   * 检查系统更新
   */
  static async checkSystemUpdate() {
    return api.get<any>({
      url: `${GO_API_BASE}/system/update`
    });
  }

  /**
   * 获取IP信息
   */
  static async getIPInfo() {
    return api.get<any>({
      url: `${GO_API_BASE}/system/ip`
    });
  }

  /**
   * 获取仪表板数据
   */
  static async getDashboard() {
    return api.get<any>({
      url: `${GO_API_BASE}/dashboard`
    });
  }
}

// ==================== 支付页面公开API ====================

/**
 * 支付页面公开API（无需认证）
 */
export class VmqGoPaymentService {
  
  /**
   * 获取支付订单信息
   * @param orderId 订单ID
   */
  static async getPaymentOrder(orderId: string) {
    return api.get<any>({
      url: `/api/public/orders/${orderId}`,
      showErrorMessage: false
    });
  }

  /**
   * 检查支付状态
   * @param orderId 订单ID
   */
  static async checkPaymentStatus(orderId: string) {
    return api.get<any>({
      url: `/api/public/orders/${orderId}/status`,
      showErrorMessage: false
    });
  }

  /**
   * 生成支付二维码
   * @param url 支付URL
   */
  static getPaymentQrcodeUrl(url: string) {
    return `/api/v2/qrcode/generate?url=${encodeURIComponent(url)}`;
  }
}

export default VmqGoService;