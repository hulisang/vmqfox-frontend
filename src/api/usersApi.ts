import request from '@/utils/http'

// 本地类型定义
interface LoginParams {
  userName: string
  password: string
}

interface LoginResponse {
  token: string
  refreshToken: string
}

interface UserInfo {
  userId: number
  userName: string
  roles: string[]
  buttons: string[]
  avatar?: string
  email?: string
  phone?: string
}

interface PaginatingParams {
  current: number
  size: number
}

interface UserListData {
  records: UserInfo[]
  current: number
  size: number
  total: number
}

export class UserService {
  // 登录
  static login(params: LoginParams) {
    return request.post<LoginResponse>({
      url: '/api/auth/login',
      params
      // showErrorMessage: false // 不显示错误消息
    })
  }

  // 获取用户信息
  static getUserInfo() {
    return request.get<UserInfo>({
      url: '/api/user/info'
    })
  }

  // 获取用户列表
  static getUserList(params: PaginatingParams) {
    return request.get<UserListData>({
      url: '/api/user/list',
      params
    })
  }
}

// 导出类型供其他文件使用
export type { LoginParams, LoginResponse, UserInfo, PaginatingParams, UserListData }
