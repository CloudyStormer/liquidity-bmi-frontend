import { useMemo, useState } from 'react'
import Taro from '@tarojs/taro'
import { Button, Input, Text, View } from '@tarojs/components'
import LoginPanel from '@/components/LoginPanel'
import TabBar from '@/components/TabBar'
import { BmiInput, BmiResult, calculateBmiResult, isValidBmiInput } from '@/utils/bmi'
import { guardFeatureUse } from '@/utils/gate'
import { AdviceResponse, fetchAdvice, saveRecord } from '@/utils/records'
import './index.css'

export default function IndexPage() {
  const [form, setForm] = useState<BmiInput>({ heightCm: 172, weightKg: 68, age: 30, gender: 'male' })
  const [result, setResult] = useState<BmiResult | null>(null)
  const [advice, setAdvice] = useState<AdviceResponse | null>(null)
  const [loginVisible, setLoginVisible] = useState(false)
  const [loading, setLoading] = useState(false)

  const idealText = useMemo(() => {
    if (!result) return '完成计算后生成'
    return `${result.healthyWeightMin} - ${result.healthyWeightMax} kg`
  }, [result])

  function updateNumber(key: keyof Pick<BmiInput, 'heightCm' | 'weightKg' | 'age'>, value: string) {
    setForm((old) => ({ ...old, [key]: Number(value) }))
  }

  function handleCalculate() {
    const message = isValidBmiInput(form)
    if (message) {
      Taro.showToast({ title: message, icon: 'none' })
      return
    }
    setAdvice(null)
    setResult(calculateBmiResult(form))
  }

  async function unlockAdvice() {
    if (!result) {
      Taro.showToast({ title: '请先完成 BMI 计算', icon: 'none' })
      return
    }
    setLoading(true)
    try {
      const allowed = await guardFeatureUse('unlock_advice', () => setLoginVisible(true))
      if (!allowed) return
      const data = await fetchAdvice({
        heightCm: result.heightCm,
        weightKg: result.weightKg,
        age: result.age,
        gender: result.gender,
        bmi: result.bmi,
        category: result.category
      })
      setAdvice(data)
    } catch (error) {
      Taro.showToast({ title: error instanceof Error ? error.message : '暂时无法解锁', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!result) {
      Taro.showToast({ title: '请先完成 BMI 计算', icon: 'none' })
      return
    }
    setLoading(true)
    try {
      const allowed = await guardFeatureUse('save_record', () => setLoginVisible(true))
      if (!allowed) return
      await saveRecord(result, advice || undefined)
      Taro.showToast({ title: '已保存记录', icon: 'success' })
    } catch (error) {
      Taro.showToast({ title: error instanceof Error ? error.message : '保存失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className='page'>
      <View className='hero'>
        <Text className='hero__eyebrow'>BMI HEALTH INDEX</Text>
        <Text className='hero__title'>身体质量指数测算</Text>
        <Text className='hero__desc'>计算免费；专业建议需登录后使用每日次数或观看激励视频解锁。</Text>
      </View>

      <View className='card'>
        <Text className='card__title'>身体数据</Text>
        <View className='grid-2'>
          <View className='field'>
            <Text className='field__label'>身高</Text>
            <Input className='field__input' type='digit' value={String(form.heightCm)} onInput={(e) => updateNumber('heightCm', String(e.detail.value))} />
            <Text className='field__unit'>cm</Text>
          </View>
          <View className='field'>
            <Text className='field__label'>体重</Text>
            <Input className='field__input' type='digit' value={String(form.weightKg)} onInput={(e) => updateNumber('weightKg', String(e.detail.value))} />
            <Text className='field__unit'>kg</Text>
          </View>
        </View>

        <View className='grid-2 grid-2--spaced'>
          <View className='field'>
            <Text className='field__label'>年龄</Text>
            <Input className='field__input' type='number' value={String(form.age)} onInput={(e) => updateNumber('age', String(e.detail.value))} />
            <Text className='field__unit'>岁</Text>
          </View>
          <View className='field'>
            <Text className='field__label'>性别</Text>
            <View className='segmented'>
              <Button className={`segmented__item ${form.gender === 'male' ? 'segmented__item--active' : ''}`} onClick={() => setForm((old) => ({ ...old, gender: 'male' }))}>男</Button>
              <Button className={`segmented__item ${form.gender === 'female' ? 'segmented__item--active' : ''}`} onClick={() => setForm((old) => ({ ...old, gender: 'female' }))}>女</Button>
            </View>
          </View>
        </View>

        <Button className='primary-button' onClick={handleCalculate}>免费计算 BMI</Button>
      </View>

      <View className='card result-card'>
        <View className='card-row'>
          <Text className='card__title'>测算结果</Text>
          <Text className='muted'>中国成人参考分层</Text>
        </View>
        {result ? (
          <>
            <Text className='bmi-value' style={{ color: result.categoryColor }}>{result.bmi}</Text>
            <Text className='bmi-label'>BMI 指数</Text>
            <View className='status-pill' style={{ backgroundColor: `${result.categoryColor}18`, color: result.categoryColor }}>
              <Text>{result.categoryText}</Text>
            </View>
            <View className='reference-box'>
              <Text className='reference-box__label'>按当前身高的成人健康体重参考</Text>
              <Text className='reference-box__value'>{idealText}</Text>
            </View>
            <Text className='note'>{result.standardNote}</Text>
          </>
        ) : (
          <Text className='empty-text'>输入身高、体重、年龄和性别后即可测算。</Text>
        )}
      </View>

      <View className='card advice-card'>
        <View className='card-row'>
          <Text className='card__title'>健康建议</Text>
          <Text className='muted'>按结果匹配</Text>
        </View>
        {advice ? (
          <View>
            <Text className='advice-title'>{advice.title}</Text>
            <Text className='advice-overview'>{advice.overview}</Text>
            {advice.sections.map((section) => (
              <View className='advice-section' key={section.title}>
                <Text className='advice-section__title'>{section.title}</Text>
                <Text className='advice-section__body'>{section.content}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View className='blur-panel'>
            <Text className='blur-line'>营养结构、运动频率、睡眠节律与复测安排</Text>
            <Text className='blur-line blur-line--short'>根据年龄、性别、BMI 区间生成</Text>
            <Button className='premium-button' loading={loading} onClick={unlockAdvice}>启封科学建议</Button>
          </View>
        )}
      </View>

      <Button className='outline-button' loading={loading} onClick={handleSave}>保存真实记录</Button>
      <LoginPanel visible={loginVisible} onClose={() => setLoginVisible(false)} onSuccess={() => setLoginVisible(false)} />
      <TabBar active='home' />
    </View>
  )
}
