interface RegisterStudentData {
  name: string
  cpf: string
  email: string
  phone: string
  courseNames: string[]
}

interface RegisterStudentResponse {
  success: boolean
  studentId?: string
  elysiumId?: string
  error?: string
}

export async function registerStudentElysium(
  data: RegisterStudentData
): Promise<RegisterStudentResponse> {
  try {
    console.log('📤 Registrando estudante no Elysium...', {
      name: data.name,
      email: data.email,
      courseNames: data.courseNames,
    })

    const response = await fetch('/api/students', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: data.name,
        cpf: data.cpf.replace(/\D/g, ''),
        email: data.email,
        phone: data.phone.replace(/\D/g, ''),
        courseNames: data.courseNames,
      }),
    })

    const result = await response.json()

    if (response.ok) {
      console.log('✅ Estudante registrado no Elysium:', result)
      return {
        success: true,
        studentId: result.student?.id,
        elysiumId: result.elysiumId,
      }
    } else {
      console.error('❌ Erro ao registrar estudante:', result.error)
      return {
        success: false,
        error: result.error || 'Erro ao registrar estudante',
      }
    }
  } catch (error) {
    console.error('❌ Erro ao registrar estudante no Elysium:', error)
    return {
      success: false,
      error: 'Erro de conexão ao registrar estudante',
    }
  }
}
