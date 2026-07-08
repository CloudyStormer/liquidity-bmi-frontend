import { request } from './api'
import { BmiInput, BmiResult } from './bmi'

export interface AdviceResponse {
  adviceId: string
  title: string
  overview: string
  sections: Array<{ title: string; content: string }>
  evidence: string[]
}

export interface BmiRecord {
  id: number
  heightCm: number
  weightKg: number
  age: number
  gender: 'male' | 'female'
  bmi: number
  category: string
  categoryText: string
  adviceTitle?: string
  createdAt: string
}

export function fetchAdvice(input: BmiInput & { bmi: number; category: string }): Promise<AdviceResponse> {
  return request<AdviceResponse>('/api/bmi/advice', 'POST', input)
}

export function saveRecord(result: BmiResult, advice?: AdviceResponse): Promise<BmiRecord> {
  return request<BmiRecord>('/api/bmi/records', 'POST', {
    heightCm: result.heightCm,
    weightKg: result.weightKg,
    age: result.age,
    gender: result.gender,
    bmi: result.bmi,
    category: result.category,
    categoryText: result.categoryText,
    adviceId: advice?.adviceId,
    adviceTitle: advice?.title
  })
}

export function listRecords(): Promise<{ records: BmiRecord[] }> {
  return request<{ records: BmiRecord[] }>('/api/bmi/records')
}
