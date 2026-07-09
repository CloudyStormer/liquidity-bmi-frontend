import Taro from '@tarojs/taro'
import { API_BASE_URL } from '@/config'
import { getToken, saveAuth, AuthState } from './auth'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

interface ApiResult<T> {
  data: T
  statusCode: number
}

export async function request<T>(path: string, method: HttpMethod = 'GET', data?: unknown): Promise<T> {
  const token = getToken()
  const res = await Taro.request({
    url: `${API_BASE_URL}${path}`,
    method,
    data,
    header: {
      'content-type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  }) as ApiResult<T & { detail?: string }>

  if (res.statusCode >= 400) {
    const message = res.data?.detail || '请求失败，请稍后重试'
    throw new Error(message)
  }
  return res.data
}

export async function loginWithWechatProfile(params: { code: string; nickname: string; avatarPath: string }): Promise<AuthState> {
  const upload = await Taro.uploadFile({
    url: `${API_BASE_URL}/api/auth/wechat-login`,
    filePath: params.avatarPath,
    name: 'avatar',
    formData: {
      code: params.code,
      nickname: params.nickname
    }
  })

  if (upload.statusCode >= 400) {
    throw new Error(upload.data || '微信登录失败')
  }

  const auth = JSON.parse(upload.data) as AuthState
  saveAuth(auth)
  return auth
}

export interface UsageStatus {
  allowed: boolean
  needAd: boolean
  remaining: number
  dailyTotal: number
  usedToday: number
  totalUsed: number
  freeRemaining: number
  adBonusRemaining: number
  adRewardsToday: number
  usageDate: string
}

export function getUsageStatus(): Promise<UsageStatus> {
  return request<UsageStatus>('/api/feature/status')
}

export function consumeFeature(feature: string): Promise<UsageStatus> {
  return request<UsageStatus>('/api/feature/consume', 'POST', { feature })
}

export function rewardAd(feature: string): Promise<UsageStatus> {
  return request<UsageStatus>('/api/feature/ad-reward', 'POST', { feature })
}
