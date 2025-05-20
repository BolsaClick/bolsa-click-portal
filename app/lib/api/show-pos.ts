 

import { cogna } from "./axios"

export async function getPosOffer(courseId: string) {
  const response = await cogna.get(`offers/showPaymentPlans/${courseId}`)
  return response.data
}
