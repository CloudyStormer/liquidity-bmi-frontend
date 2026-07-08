import Taro from '@tarojs/taro'
import { getToken } from './auth'
import { consumeFeature, rewardAd } from './api'
import { watchRewardedAd } from './ad'

export async function guardFeatureUse(feature: string, onNeedLogin: () => void): Promise<boolean> {
  if (!getToken()) {
    onNeedLogin()
    return false
  }

  const usage = await consumeFeature(feature)
  if (usage.allowed) return true

  if (usage.needAd) {
    await Taro.showModal({
      title: '今日免费次数已用完',
      content: '完整观看一次激励视频后，可增加 1 次今日使用机会。',
      confirmText: '观看广告',
      cancelText: '稍后'
    }).then(async (res) => {
      if (!res.confirm) throw new Error('已取消观看广告')
      await watchRewardedAd()
      await rewardAd(feature)
    })
    const retry = await consumeFeature(feature)
    return retry.allowed
  }

  return false
}
