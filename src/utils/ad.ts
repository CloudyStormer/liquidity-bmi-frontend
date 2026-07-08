import Taro from '@tarojs/taro'
import { ENABLE_DEV_AD_FALLBACK, REWARDED_AD_UNIT_ID } from '@/config'

export async function watchRewardedAd(): Promise<void> {
  if (REWARDED_AD_UNIT_ID && Taro.createRewardedVideoAd) {
    const ad = Taro.createRewardedVideoAd({ adUnitId: REWARDED_AD_UNIT_ID })
    await ad.load()
    await ad.show()
    return await new Promise((resolve, reject) => {
      ad.onClose((res) => {
        if (res?.isEnded) resolve()
        else reject(new Error('广告未完整观看，暂不能继续使用'))
      })
      ad.onError((err) => reject(new Error(err?.errMsg || '广告加载失败')))
    })
  }

  if (ENABLE_DEV_AD_FALLBACK) {
    const result = await Taro.showModal({
      title: '开发环境广告模拟',
      content: '正式发布需配置微信激励视频广告位。当前确认后模拟一次完整观看。',
      confirmText: '模拟完成'
    })
    if (result.confirm) return
  }

  throw new Error('请先配置微信激励视频广告位')
}
