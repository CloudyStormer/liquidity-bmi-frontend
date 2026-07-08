import { useEffect, useState } from 'react'
import Taro, { useDidShow } from '@tarojs/taro'
import { Button, Canvas, Text, View } from '@tarojs/components'
import LoginPanel from '@/components/LoginPanel'
import TabBar from '@/components/TabBar'
import { getToken } from '@/utils/auth'
import { guardFeatureUse } from '@/utils/gate'
import { BmiRecord, listRecords } from '@/utils/records'
import './index.css'

export default function RecordPage() {
  const [records, setRecords] = useState<BmiRecord[]>([])
  const [loginVisible, setLoginVisible] = useState(false)
  const [loading, setLoading] = useState(false)

  useDidShow(() => {
    if (getToken()) {
      loadRecords(false)
    }
  })

  useEffect(() => {
    drawTrend(records)
  }, [records])

  async function loadRecords(consume = true) {
    if (!getToken()) {
      setLoginVisible(true)
      return
    }
    setLoading(true)
    try {
      if (consume) {
        const allowed = await guardFeatureUse('view_records', () => setLoginVisible(true))
        if (!allowed) return
      }
      const data = await listRecords()
      setRecords(data.records)
    } catch (error) {
      Taro.showToast({ title: error instanceof Error ? error.message : '读取失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  function drawTrend(source: BmiRecord[]) {
    const ctx = Taro.createCanvasContext('bmiTrendCanvas')
    ctx.clearRect(0, 0, 335, 210)
    ctx.setFillStyle('#ffffff')
    ctx.fillRect(0, 0, 335, 210)
    ctx.setStrokeStyle('#e6efea')
    ctx.setLineWidth(1)
    for (let i = 0; i < 5; i += 1) {
      const y = 20 + i * 40
      ctx.beginPath()
      ctx.moveTo(18, y)
      ctx.lineTo(318, y)
      ctx.stroke()
    }

    const points = [...source].reverse().slice(-7)
    if (points.length < 2) {
      ctx.setFillStyle('#8b9992')
      ctx.setFontSize(13)
      ctx.fillText('保存至少 2 条记录后生成趋势曲线', 58, 106)
      ctx.draw()
      return
    }

    const values = points.map((item) => item.bmi)
    const min = Math.floor(Math.min(...values) - 1)
    const max = Math.ceil(Math.max(...values) + 1)
    const span = Math.max(max - min, 1)
    const stepX = 300 / (points.length - 1)

    ctx.setStrokeStyle('#2f936b')
    ctx.setLineWidth(3)
    ctx.beginPath()
    points.forEach((point, index) => {
      const x = 18 + index * stepX
      const y = 180 - ((point.bmi - min) / span) * 150
      if (index === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.stroke()

    points.forEach((point, index) => {
      const x = 18 + index * stepX
      const y = 180 - ((point.bmi - min) / span) * 150
      ctx.beginPath()
      ctx.setFillStyle(index === points.length - 1 ? '#2f936b' : '#ffffff')
      ctx.setStrokeStyle('#2f936b')
      ctx.arc(x, y, index === points.length - 1 ? 5 : 4, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
      ctx.setFillStyle('#66746d')
      ctx.setFontSize(10)
      ctx.fillText(String(point.bmi), x - 8, y - 10)
    })
    ctx.draw()
  }

  return (
    <View className='record-page'>
      <View className='record-header'>
        <Text className='record-header__title'>真实记录曲线</Text>
        <Text className='record-header__desc'>所有记录由后端按当前 openid 绑定用户隔离保存。</Text>
      </View>

      <View className='record-card'>
        <View className='record-card__top'>
          <Text className='record-card__title'>BMI Canvas 曲线</Text>
          <Button className='mini-button' loading={loading} onClick={() => loadRecords(true)}>刷新</Button>
        </View>
        <Canvas canvasId='bmiTrendCanvas' className='trend-canvas' />
      </View>

      <View className='record-card'>
        <Text className='record-card__title'>历史数据</Text>
        {records.length ? records.map((item) => (
          <View className='record-row' key={item.id}>
            <View>
              <Text className='record-row__date'>{item.createdAt.slice(0, 10)}</Text>
              <Text className='record-row__meta'>{item.gender === 'male' ? '男' : '女'} · {item.age}岁 · {item.heightCm}cm</Text>
            </View>
            <View className='record-row__right'>
              <Text className='record-row__bmi'>{item.bmi}</Text>
              <Text className='record-row__tag'>{item.categoryText}</Text>
            </View>
          </View>
        )) : (
          <View className='empty-state'>
            <Text>暂无记录。保存测算结果后会显示真实曲线。</Text>
          </View>
        )}
      </View>

      <LoginPanel visible={loginVisible} onClose={() => setLoginVisible(false)} onSuccess={() => loadRecords(false)} />
      <TabBar active='record' />
    </View>
  )
}
