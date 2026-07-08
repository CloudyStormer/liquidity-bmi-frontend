import Taro from '@tarojs/taro'

export interface UserProfile {
  id: number
  nickname: string
  avatarUrl: string
  openidMasked: string
}

export interface AuthState {
  token: string
  user: UserProfile
}

const TOKEN_KEY = 'liquidity_bmi_token'
const USER_KEY = 'liquidity_bmi_user'

export function getToken(): string {
  return Taro.getStorageSync(TOKEN_KEY) || ''
}

export function getUser(): UserProfile | null {
  return Taro.getStorageSync(USER_KEY) || null
}

export function saveAuth(auth: AuthState): void {
  Taro.setStorageSync(TOKEN_KEY, auth.token)
  Taro.setStorageSync(USER_KEY, auth.user)
}

export function clearAuth(): void {
  Taro.removeStorageSync(TOKEN_KEY)
  Taro.removeStorageSync(USER_KEY)
}

export function maskOpenid(openid: string): string {
  if (!openid) return ''
  if (openid.length <= 8) return openid
  return `${openid.slice(0, 4)}****${openid.slice(-4)}`
}
