import Taro from '@tarojs/taro'
import { getToken } from './auth'
import { consumeFeature, rewardAd, UsageStatus } from './api'
import { watchRewardedAd } from './ad'

export async function guardFeatureUse(
  feature: string,
  onNeedLogin: () => void,
  onUsageChange?: (usage: UsageStatus) => void
): Promise<boolean> {
  if (!getToken()) {
    onNeedLogin()
    return false
  }

  const usage = await consumeFeature(feature)
  onUsageChange?.(usage)
  if (usage.allowed) return true

  if (usage.needAd) {
    await Taro.showModal({
      title: '今日次数已用完',
      content: '完整观看一次激励视频后，今日可用次数增加 1 次。',
      confirmText: '观看广告',
      cancelText: '稍后'
    }).then(async (res) => {
      if (!res.confirm) throw new Error('已取消观看广告')
      await watchRewardedAd()
      const rewarded = await rewardAd(feature)
      onUsageChange?.(rewarded)
    })
    const retry = await consumeFeature(feature)
    onUsageChange?.(retry)
    return retry.allowed
  }

  return false
}
