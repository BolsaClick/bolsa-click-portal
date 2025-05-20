/* eslint-disable @typescript-eslint/no-explicit-any */

import { cogna } from "./axios"

export async function createStudentCognaPos(studentData: any) {
  try {
    const response = await cogna.post(
      'candidate/v2/storeCandidateWeb',
      studentData,
    )
    return response.data
  } catch (error) {
    console.error('Error creating student:', error)
    throw error
  }
}
