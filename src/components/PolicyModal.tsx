import { Button, ScrollView, Text, View } from '@tarojs/components'
import './PolicyModal.css'

interface Props {
  type: 'agreement' | 'privacy' | 'version' | ''
  onClose: () => void
}

const content = {
  agreement: {
    title: '用户协议',
    body: [
      '本服务用于记录用户主动提交的身高、体重、年龄、性别与 BMI 测算结果，相关结果仅作为健康管理参考，不替代医疗诊断、治疗或处方建议。',
      '用户应确保提交信息真实、准确，并理解 BMI 不能完整反映肌肉量、孕期、疾病状态等特殊情况。存在明显不适或慢性病管理需求时，应咨询具备资质的医疗卫生专业人员。',
      '平台会按照最小必要原则提供登录、记录、建议解锁等功能，并通过账号唯一 openid 进行用户隔离。用户不得尝试访问、干扰他人数据或服务安全。'
    ]
  },
  privacy: {
    title: '隐私政策',
    body: [
      '我们会在用户主动授权后收集微信头像、昵称，并通过微信官方登录接口获取 openid，用于创建唯一账号、保存 BMI 记录和区分不同用户。',
      '我们收集的健康测算数据包括身高、体重、年龄、性别、BMI、分类结果、建议编号和创建时间。上述数据仅用于向本人展示历史记录、趋势曲线和健康建议。',
      '服务端接口默认要求登录 token，并按当前用户 id 查询和写入数据，防止不同用户之间的数据互相可见。用户可联系运营方申请查询、更正或删除个人数据。'
    ]
  },
  version: {
    title: '版本信息',
    body: [
      '当前版本：v1.0.0',
      '核心能力：科学 BMI 测算、微信官方登录、每日 3 次建议解锁、激励视频增加次数、个人记录与趋势曲线。',
      '医学口径：成人 BMI 使用体重 kg / 身高 m² 公式，成人分层参考中国成人体重判定；未成年人提示需结合年龄与性别百分位评估。'
    ]
  }
}

export default function PolicyModal({ type, onClose }: Props) {
  if (!type) return null
  const detail = content[type]
  return (
    <View className='policy-mask'>
      <View className='policy-modal'>
        <Text className='policy-title'>{detail.title}</Text>
        <ScrollView scrollY className='policy-body'>
          {detail.body.map((item, index) => (
            <Text key={item} className='policy-p'>{index + 1}. {item}</Text>
          ))}
        </ScrollView>
        <Button className='policy-close' onClick={onClose}>我已知悉</Button>
      </View>
    </View>
  )
}
