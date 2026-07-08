import { useState } from 'react'
import Taro, { useDidShow } from '@tarojs/taro'
import { Button, Image, Text, View } from '@tarojs/components'
import LoginPanel from '@/components/LoginPanel'
import PolicyModal from '@/components/PolicyModal'
import TabBar from '@/components/TabBar'
import { APP_VERSION } from '@/config'
import { clearAuth, getUser, UserProfile } from '@/utils/auth'
import { getUsageStatus, UsageStatus } from '@/utils/api'
import './index.css'

type PolicyType = 'agreement' | 'privacy' | 'version' | ''

export default function MinePage() {
  const [user, setUser] = useState<UserProfile | null>(getUser())
  const [usage, setUsage] = useState<UsageStatus | null>(null)
  const [loginVisible, setLoginVisible] = useState(false)
  const [policyType, setPolicyType] = useState<PolicyType>('')

  useDidShow(() => {
    refreshProfile()
  })

  async function refreshProfile() {
    setUser(getUser())
    if (getUser()) {
      try {
        setUsage(await getUsageStatus())
      } catch {
        setUsage(null)
      }
    }
  }

  function logout() {
    clearAuth()
    setUser(null)
    setUsage(null)
    Taro.showToast({ title: '已退出登录', icon: 'success' })
  }

  return (
    <View className='mine-page'>
      <View className='profile-card' onClick={() => !user && setLoginVisible(true)}>
        <View className='avatar-wrap'>
          {user?.avatarUrl ? <Image className='avatar' src={user.avatarUrl} mode='aspectFill' /> : <Text className='avatar-placeholder'>未登录</Text>}
        </View>
        <View className='profile-info'>
          <Text className='profile-name'>{user?.nickname || '微信用户'}</Text>
          <Text className='profile-sub'>{user ? `openid ${user.openidMasked}` : '点击完成微信官方登录'}</Text>
        </View>
        <Text className='chevron'>›</Text>
      </View>

      <View className='quota-card'>
        <Text className='quota-card__title'>今日功能次数</Text>
        <Text className='quota-card__value'>{usage ? usage.remaining : '--'}</Text>
        <Text className='quota-card__desc'>每天 0 点刷新 3 次；广告完整观看后 +1 次。</Text>
      </View>

      <View className='menu-card'>
        <MenuItem title='用户协议' desc='服务边界与用户责任' onClick={() => setPolicyType('agreement')} />
        <MenuItem title='隐私政策' desc='openid、头像昵称与健康记录说明' onClick={() => setPolicyType('privacy')} />
        <MenuItem title='版本信息' desc={`v${APP_VERSION}`} onClick={() => setPolicyType('version')} />
      </View>

      {user ? <Button className='logout-button' onClick={logout}>退出登录</Button> : <Button className='login-button' onClick={() => setLoginVisible(true)}>微信授权登录</Button>}

      <LoginPanel visible={loginVisible} onClose={() => setLoginVisible(false)} onSuccess={refreshProfile} />
      <PolicyModal type={policyType} onClose={() => setPolicyType('')} />
      <TabBar active='mine' />
    </View>
  )
}

function MenuItem({ title, desc, onClick }: { title: string; desc: string; onClick: () => void }) {
  return (
    <View className='menu-item' onClick={onClick}>
      <View>
        <Text className='menu-item__title'>{title}</Text>
        <Text className='menu-item__desc'>{desc}</Text>
      </View>
      <Text className='chevron'>›</Text>
    </View>
  )
}
