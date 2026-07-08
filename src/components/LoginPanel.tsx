import { useState } from 'react'
import Taro from '@tarojs/taro'
import { Button, Image, Input, Text, View } from '@tarojs/components'
import { loginWithWechatProfile } from '@/utils/api'
import './LoginPanel.css'

interface Props {
  visible: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function LoginPanel({ visible, onClose, onSuccess }: Props) {
  const [avatarPath, setAvatarPath] = useState('')
  const [nickname, setNickname] = useState('')
  const [loading, setLoading] = useState(false)

  if (!visible) return null

  async function handleLogin() {
    if (!avatarPath) {
      Taro.showToast({ title: '请先选择微信头像', icon: 'none' })
      return
    }
    if (!nickname.trim()) {
      Taro.showToast({ title: '请填写微信昵称', icon: 'none' })
      return
    }

    setLoading(true)
    try {
      const login = await Taro.login()
      if (!login.code) throw new Error('未获取到微信登录 code')
      await loginWithWechatProfile({
        code: login.code,
        nickname: nickname.trim(),
        avatarPath
      })
      Taro.showToast({ title: '登录成功', icon: 'success' })
      onSuccess()
      onClose()
    } catch (error) {
      Taro.showToast({ title: error instanceof Error ? error.message : '登录失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className='login-mask'>
      <View className='login-panel'>
        <View className='login-panel__handle' />
        <Text className='login-panel__title'>微信授权登录</Text>
        <Text className='login-panel__desc'>使用微信官方登录能力，确认头像和昵称后绑定唯一 openid。</Text>

        <Button
          className='login-avatar'
          openType='chooseAvatar'
          onChooseAvatar={(event) => {
            const detail = event.detail as unknown as { avatarUrl?: string }
            if (detail.avatarUrl) setAvatarPath(detail.avatarUrl)
          }}
        >
          {avatarPath ? <Image className='login-avatar__image' src={avatarPath} mode='aspectFill' /> : <Text className='login-avatar__text'>选择头像</Text>}
        </Button>

        <View className='login-field'>
          <Text className='login-field__label'>微信昵称</Text>
          <Input
            className='login-field__input'
            type={'nickname' as 'text'}
            placeholder='请输入或选择微信昵称'
            value={nickname}
            onInput={(event) => setNickname(String(event.detail.value || ''))}
          />
        </View>

        <Button className='login-submit' loading={loading} onClick={handleLogin}>确认并登录</Button>
        <Button className='login-cancel' onClick={onClose}>暂不登录</Button>
      </View>
    </View>
  )
}
