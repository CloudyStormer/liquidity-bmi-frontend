export type Gender = 'male' | 'female'

export type BmiCategory = 'underweight' | 'normal' | 'overweight' | 'obese' | 'minor'

export interface BmiInput {
  heightCm: number
  weightKg: number
  age: number
  gender: Gender
}

export interface BmiResult extends BmiInput {
  bmi: number
  category: BmiCategory
  categoryText: string
  categoryColor: string
  healthyWeightMin: number
  healthyWeightMax: number
  summary: string
  standardNote: string
}

const adultCategoryMeta: Record<Exclude<BmiCategory, 'minor'>, { text: string; color: string; summary: string }> = {
  underweight: {
    text: '偏低',
    color: '#3974c6',
    summary: 'BMI 低于成人健康参考区间，建议关注能量、蛋白质摄入与近期体重变化。'
  },
  normal: {
    text: '正常',
    color: '#2f936b',
    summary: 'BMI 位于成人健康参考区间，建议保持当前体重管理节奏。'
  },
  overweight: {
    text: '超重',
    color: '#b56b24',
    summary: 'BMI 高于成人健康参考区间，建议优先改善饮食结构和规律运动。'
  },
  obese: {
    text: '肥胖',
    color: '#c84648',
    summary: 'BMI 已达到肥胖范围，建议在专业人员指导下制定体重管理计划。'
  }
}

export function calculateBmiResult(input: BmiInput): BmiResult {
  const heightM = input.heightCm / 100
  const bmi = round1(input.weightKg / (heightM * heightM))
  const healthyWeightMin = round1(18.5 * heightM * heightM)
  const healthyWeightMax = round1(23.9 * heightM * heightM)

  if (input.age < 18) {
    return {
      ...input,
      bmi,
      category: 'minor',
      categoryText: '需按年龄性别评估',
      categoryColor: '#6f5ab8',
      healthyWeightMin,
      healthyWeightMax,
      summary: '儿童青少年 BMI 解释应使用年龄、性别对应的百分位曲线，不能直接套用成人阈值。',
      standardNote: 'BMI=体重kg/身高m²；未成年人需结合年龄、性别百分位和生长发育情况。'
    }
  }

  const category = classifyChinaAdultBmi(bmi)
  const meta = adultCategoryMeta[category]
  return {
    ...input,
    bmi,
    category,
    categoryText: meta.text,
    categoryColor: meta.color,
    healthyWeightMin,
    healthyWeightMax,
    summary: meta.summary,
    standardNote: 'BMI=体重kg/身高m²；成人分层参考中国成人体重判定 WS/T 428-2013，性别与年龄用于风险解释和建议。'
  }
}

export function classifyChinaAdultBmi(bmi: number): Exclude<BmiCategory, 'minor'> {
  if (bmi < 18.5) return 'underweight'
  if (bmi < 24) return 'normal'
  if (bmi < 28) return 'overweight'
  return 'obese'
}

export function round1(value: number): number {
  return Math.round(value * 10) / 10
}

export function isValidBmiInput(input: BmiInput): string {
  if (!input.heightCm || input.heightCm < 80 || input.heightCm > 230) return '请输入 80-230cm 之间的身高'
  if (!input.weightKg || input.weightKg < 20 || input.weightKg > 250) return '请输入 20-250kg 之间的体重'
  if (!input.age || input.age < 2 || input.age > 100) return '请输入 2-100 岁之间的年龄'
  return ''
}
