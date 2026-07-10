import Taro, { useDidShow, useShareAppMessage, useShareTimeline } from '@tarojs/taro'

const SHARE_TITLE = 'BMI健康测算'
const SHARE_PATH = '/pages/index/index'

export function useAppShare() {
  useDidShow(() => {
    if (Taro.getEnv() !== Taro.ENV_TYPE.WEAPP || !Taro.showShareMenu) return
    Taro.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    } as Parameters<typeof Taro.showShareMenu>[0] & { menus: string[] }).catch(() => {
      // Sharing availability is controlled by the WeChat runtime/version.
    })
  })

  useShareAppMessage(() => ({
    title: SHARE_TITLE,
    path: SHARE_PATH
  }))

  useShareTimeline(() => ({
    title: SHARE_TITLE,
    query: ''
  }))
}
