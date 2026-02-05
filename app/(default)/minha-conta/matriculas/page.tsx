'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  GraduationCap,
  Building2,
  MapPin,
  Clock,
  Calendar,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react'
import { useAuth } from '@/app/contexts/AuthContext'
import { formatCurrency } from '@/utils/fomartCurrency'

interface Enrollment {
  id: string
  courseId: string
  courseName: string
  institutionName: string
  modalidade: string
  turno: string | null
  originalPrice: number | null
  finalPrice: number | null
  discount: number | null
  status: 'PENDING' | 'IN_PROGRESS' | 'ENROLLED' | 'CANCELLED' | 'COMPLETED'
  paymentStatus: 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'CANCELLED'
  enrollmentDate: string | null
  startDate: string | null
  externalId: string | null
  createdAt: string
}

const statusConfig = {
  PENDING: {
    label: 'Pendente',
    color: 'bg-yellow-100 text-yellow-800',
    icon: Clock,
  },
  IN_PROGRESS: {
    label: 'Em Andamento',
    color: 'bg-blue-100 text-blue-800',
    icon: Loader2,
  },
  ENROLLED: {
    label: 'Matriculado',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle2,
  },
  CANCELLED: {
    label: 'Cancelado',
    color: 'bg-red-100 text-red-800',
    icon: XCircle,
  },
  COMPLETED: {
    label: 'Concluído',
    color: 'bg-purple-100 text-purple-800',
    icon: CheckCircle2,
  },
}

const paymentStatusConfig = {
  PENDING: { label: 'Aguardando', color: 'text-yellow-600' },
  PROCESSING: { label: 'Processando', color: 'text-blue-600' },
  PAID: { label: 'Pago', color: 'text-green-600' },
  FAILED: { label: 'Falhou', color: 'text-red-600' },
  REFUNDED: { label: 'Reembolsado', color: 'text-gray-600' },
  CANCELLED: { label: 'Cancelado', color: 'text-red-600' },
}

export default function MatriculasPage() {
  const router = useRouter()
  const { user, firebaseUser, loading: authLoading } = useAuth()
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/minha-conta/matriculas')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    const fetchEnrollments = async () => {
      if (!firebaseUser) return

      try {
        const idToken = await firebaseUser.getIdToken()
        const response = await fetch('/api/user/enrollments', {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        })

        if (!response.ok) {
          throw new Error('Erro ao carregar matrículas')
        }

        const data = await response.json()
        setEnrollments(data.enrollments || [])
      } catch (err) {
        console.error('Error fetching enrollments:', err)
        setError('Não foi possível carregar suas matrículas')
      } finally {
        setLoading(false)
      }
    }

    if (firebaseUser) {
      fetchEnrollments()
    }
  }, [firebaseUser])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-bolsa-primary" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/minha-conta"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Minhas Matrículas</h1>
            <p className="text-gray-500">Acompanhe todas as suas inscrições</p>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!error && enrollments.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhuma matrícula encontrada
            </h2>
            <p className="text-gray-500 mb-6">
              Você ainda não realizou nenhuma inscrição em cursos.
            </p>
            <Link
              href="/cursos"
              className="inline-flex items-center gap-2 bg-bolsa-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-bolsa-primary/90 transition-colors"
            >
              Explorar Cursos
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Enrollments List */}
        {enrollments.length > 0 && (
          <div className="space-y-4">
            {enrollments.map((enrollment) => {
              const status = statusConfig[enrollment.status]
              const StatusIcon = status.icon
              const paymentStatus = paymentStatusConfig[enrollment.paymentStatus]

              return (
                <div
                  key={enrollment.id}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden"
                >
                  {/* Status Banner */}
                  <div className={`px-4 py-2 ${status.color} flex items-center gap-2`}>
                    <StatusIcon className="w-4 h-4" />
                    <span className="text-sm font-medium">{status.label}</span>
                    {enrollment.externalId && (
                      <span className="ml-auto text-xs opacity-75">
                        ID: {enrollment.externalId}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      {/* Course Info */}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {enrollment.courseName}
                        </h3>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Building2 className="w-4 h-4 text-gray-400" />
                            <span>{enrollment.institutionName}</span>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span>
                              {enrollment.modalidade}
                              {enrollment.turno && enrollment.turno !== 'VIRTUAL' && ` - ${enrollment.turno}`}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>Inscrito em {formatDate(enrollment.enrollmentDate || enrollment.createdAt)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Price Info */}
                      <div className="md:text-right">
                        {enrollment.finalPrice && (
                          <div className="mb-2">
                            {enrollment.originalPrice && enrollment.originalPrice > enrollment.finalPrice && (
                              <p className="text-sm text-gray-400 line-through">
                                {formatCurrency(enrollment.originalPrice)}
                              </p>
                            )}
                            <p className="text-xl font-bold text-green-600">
                              {formatCurrency(enrollment.finalPrice)}
                              <span className="text-sm font-normal text-gray-500">/mês</span>
                            </p>
                            {enrollment.discount && enrollment.discount > 0 && (
                              <p className="text-sm text-green-600">
                                Economia de {formatCurrency(enrollment.discount)}
                              </p>
                            )}
                          </div>
                        )}

                        <p className={`text-sm font-medium ${paymentStatus.color}`}>
                          Pagamento: {paymentStatus.label}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Help Link */}
        <p className="text-center mt-8 text-gray-500 text-sm">
          Dúvidas sobre sua matrícula?{' '}
          <Link href="/central-de-ajuda" className="text-bolsa-primary hover:underline">
            Entre em contato
          </Link>
        </p>
      </div>
    </div>
  )
}
