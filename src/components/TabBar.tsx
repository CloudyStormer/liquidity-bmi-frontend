import Taro from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import './TabBar.css'

type TabKey = 'home' | 'record' | 'mine'

const tabs: Array<{ key: TabKey; label: string; icon: string; path: string }> = [
  { key: 'home', label: '测算', icon: '⌂', path: '/pages/index/index' },
  { key: 'record', label: '记录', icon: '⌁', path: '/pages/record/index' },
  { key: 'mine', label: '我的', icon: '◦', path: '/pages/mine/index' }
]

export default function TabBar({ active }: { active: TabKey }) {
  return (
    <View className='tabbar safe-bottom'>
      {tabs.map((tab) => (
        <View
          key={tab.key}
          className={`tabbar__item ${active === tab.key ? 'tabbar__item--active' : ''}`}
          onClick={() => active !== tab.key && Taro.redirectTo({ url: tab.path })}
        >
          <Text className='tabbar__icon'>{tab.icon}</Text>
          <Text className='tabbar__label'>{tab.label}</Text>
        </View>
      ))}
    </View>
  )
}
