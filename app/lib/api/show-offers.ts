 
import { cogna } from "./axios"


export interface CourseData {
  data: {
    shifts: Record<string, Shift>
  }
}
export interface Shift {
  [key: string]: CourseOffer
}

export interface CourseOffer {
  offerId: string
  offerBusinessKey: string
  shift: string
  subscriptionValue: number
  montlyFeeFrom: number
  montlyFeeTo: number
  expiredAt: string
  weekday: string
  classTimeStart: string
  classTimeEnd: string
  brand: string
  course: string
  courseId: string
  unit: string
  unitId: string
  unitAddress: string
  unitCity: string
  unitState: string
  modality: string
  lateEnrollment: LateEnrollment
}

export interface FinancialBusinessOffer {
  baseValue: number
  netValue: number
  installments: Installment[]
}

export interface LateEnrollment {
  baseValue: number
  netValue: number
  installments: Installment[]
  lateEnrollmentPaymentPlan: LateEnrollmentPaymentPlan
}

export interface Installment {
  installment: string
  netValue: number
  ponctualityDiscountNetValue: number
}

export interface LateEnrollmentPaymentPlan {
  description: string
  installmentCount: number
  amount: number
}

export async function getCourseOffer(
  city: string,
  state: string,
  courseId: string,
  courseName: string,
  unitId: string,
  modality: string,
  brand: string,
) {
  const response = await cogna.get<CourseData>(
    `offers/v3/showShiftOffers?brand=${brand}&modality=${modality}&courseId=${courseId}&courseName=${courseName}&unitId=${unitId}&city=${city}&state=${state}&app=DC`,
  )
  return response.data
}
