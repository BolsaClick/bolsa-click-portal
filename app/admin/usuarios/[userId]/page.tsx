'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  Loader2,
  User as UserIcon,
  GraduationCap,
  Heart,
  Search,
  BookOpen,
  Clock,
  CreditCard,
  Shield,
} from 'lucide-react'
import { useAuth } from '@/app/contexts/AuthContext'
import { useAdmin } from '@/app/contexts/AdminAuthContext'

interface Enrollment {
  id: string
  courseName: string
  institutionName: string
  modalidade: string
  turno: string | null
  originalPrice: number | null
  finalPrice: number | null
  discount: number | null
  status: string
  paymentStatus: string
  createdAt: string
}

interface Favorite {
  id: string
  courseName: string
  courseSlug: string
  institutionName: string | null
  modalidade: string | null
  price: number | null
  discount: number | null
  createdAt: string
}

interface SearchHistoryItem {
  id: string
  query: string | null
  course: string | null
  city: string | null
  state: string | null
  modalidade: string | null
  nivel: string | null
  createdAt: string
}

interface UserDetail {
  id: string
  firebaseUid: string
  email: string
  name: string | null
  phone: string | null
  cpf: string | null
  avatar: string | null
  cep: string | null
  street: string | null
  number: string | null
  complement: string | null
  neighborhood: string | null
  city: string | null
  state: string | null
  educationLevel: string | null
  currentSchool: string | null
  emailVerified: boolean
  isActive: boolean
  receiveEmails: boolean
  receiveSms: boolean
  receiveWhatsapp: boolean
  createdAt: string
  updatedAt: string
  lastLoginAt: string | null
  enrollments: Enrollment[]
  favorites: Favorite[]
  searchHistory: SearchHistoryItem[]
  _count: {
    enrollments: number
    favorites: number
    searchHistory: number
  }
}

const statusLabels: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
  IN_PROGRESS: { label: 'Em andamento', color: 'bg-blue-100 text-blue-800' },
  ENROLLED: { label: 'Matriculado', color: 'bg-green-100 text-green-800' },
  CANCELLED: { label: 'Cancelado', color: 'bg-red-100 text-red-800' },
  COMPLETED: { label: 'Concluído', color: 'bg-purple-100 text-purple-800' },
}

const paymentStatusLabels: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
  PROCESSING: { label: 'Processando', color: 'bg-blue-100 text-blue-800' },
  PAID: { label: 'Pago', color: 'bg-green-100 text-green-800' },
  FAILED: { label: 'Falhou', color: 'bg-red-100 text-red-800' },
  REFUNDED: { label: 'Reembolsado', color: 'bg-orange-100 text-orange-800' },
  CANCELLED: { label: 'Cancelado', color: 'bg-gray-100 text-gray-800' },
}

const educationLabels: Record<string, string> = {
  ENSINO_MEDIO: 'Ensino Médio',
  GRADUACAO: 'Graduação',
  POS_GRADUACAO: 'Pós-Graduação',
}

export default function AdminUserDetailPage() {
  const { userId } = useParams<{ userId: string }>()
  const router = useRouter()
  const { firebaseUser } = useAuth()
  const { hasPermission } = useAdmin()
  const [user, setUser] = useState<UserDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'enrollments' | 'favorites' | 'history'>('enrollments')

  useEffect(() => {
    const fetchUser = async () => {
      if (!firebaseUser || !hasPermission('users')) return

      setLoading(true)
      try {
        const token = await firebaseUser.getIdToken()
        const response = await fetch(`/api/admin/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        } else if (response.status === 404) {
          router.push('/admin/usuarios')
        }
      } catch (error) {
        console.error('Error fetching user:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [firebaseUser, hasPermission, userId, router])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatCurrency = (value: number | null) => {
    if (value === null) return '-'
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  const formatAddress = (u: UserDetail) => {
    const parts = [
      u.street,
      u.number,
      u.complement,
      u.neighborhood,
      u.city && u.state ? `${u.city}/${u.state}` : u.city || u.state,
      u.cep,
    ].filter(Boolean)
    return parts.length > 0 ? parts.join(', ') : null
  }

  if (!hasPermission('users')) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Você não tem permissão para acessar esta página.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-bolsa-primary" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <UserIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Usuário não encontrado</p>
        <Link href="/admin/usuarios" className="text-bolsa-primary hover:underline mt-2 inline-block">
          Voltar para lista
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin/usuarios"
          className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 text-sm mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para usuários
        </Link>

        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="w-16 h-16 bg-bolsa-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name || ''} className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <span className="text-bolsa-primary font-bold text-2xl">
                {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">
              {user.name || 'Sem nome'}
            </h1>
            <p className="text-gray-500">{user.email}</p>
          </div>
          <div className="flex items-center gap-2">
            {user.isActive ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <CheckCircle className="w-4 h-4" />
                Ativo
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                <XCircle className="w-4 h-4" />
                Inativo
              </span>
            )}
            {user.emailVerified ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                <Mail className="w-4 h-4" />
                Email verificado
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
                <Mail className="w-4 h-4" />
                Email não verificado
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{user._count.enrollments}</p>
            <p className="text-sm text-gray-500">Matrículas</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
            <Heart className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{user._count.favorites}</p>
            <p className="text-sm text-gray-500">Favoritos</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Search className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{user._count.searchHistory}</p>
            <p className="text-sm text-gray-500">Buscas</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Dados Pessoais */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <UserIcon className="w-5 h-5" />
            Dados Pessoais
          </h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-gray-900">{user.email}</p>
              </div>
            </div>
            {user.phone && (
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Telefone</p>
                  <p className="text-gray-900">{user.phone}</p>
                </div>
              </div>
            )}
            {user.cpf && (
              <div className="flex items-start gap-3">
                <Shield className="w-4 h-4 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">CPF</p>
                  <p className="text-gray-900">{user.cpf}</p>
                </div>
              </div>
            )}
            {formatAddress(user) && (
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Endereço</p>
                  <p className="text-gray-900">{formatAddress(user)}</p>
                </div>
              </div>
            )}
            {user.educationLevel && (
              <div className="flex items-start gap-3">
                <BookOpen className="w-4 h-4 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Nível de Escolaridade</p>
                  <p className="text-gray-900">{educationLabels[user.educationLevel] || user.educationLevel}</p>
                </div>
              </div>
            )}
            {user.currentSchool && (
              <div className="flex items-start gap-3">
                <GraduationCap className="w-4 h-4 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Escola/Instituição Atual</p>
                  <p className="text-gray-900">{user.currentSchool}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Informações do Sistema */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Informações do Sistema
          </h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Data de Cadastro</p>
                <p className="text-gray-900">{formatDateTime(user.createdAt)}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Última Atualização</p>
                <p className="text-gray-900">{formatDateTime(user.updatedAt)}</p>
              </div>
            </div>
            {user.lastLoginAt && (
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Último Login</p>
                  <p className="text-gray-900">{formatDateTime(user.lastLoginAt)}</p>
                </div>
              </div>
            )}
            <div className="pt-3 border-t border-gray-100">
              <p className="text-sm text-gray-500 mb-2">Preferências de Comunicação</p>
              <div className="flex flex-wrap gap-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.receiveEmails ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                  {user.receiveEmails ? '✓' : '✗'} Email
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.receiveSms ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                  {user.receiveSms ? '✓' : '✗'} SMS
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.receiveWhatsapp ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                  {user.receiveWhatsapp ? '✓' : '✗'} WhatsApp
                </span>
              </div>
            </div>
            <div className="pt-3 border-t border-gray-100">
              <p className="text-sm text-gray-500 mb-1">Firebase UID</p>
              <p className="text-xs text-gray-400 font-mono break-all">{user.firebaseUid}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('enrollments')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'enrollments'
                  ? 'border-bolsa-primary text-bolsa-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <GraduationCap className="w-4 h-4 inline-block mr-1" />
              Matrículas ({user._count.enrollments})
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'favorites'
                  ? 'border-bolsa-primary text-bolsa-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Heart className="w-4 h-4 inline-block mr-1" />
              Favoritos ({user._count.favorites})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'history'
                  ? 'border-bolsa-primary text-bolsa-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Search className="w-4 h-4 inline-block mr-1" />
              Histórico de Buscas ({user._count.searchHistory})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Matrículas Tab */}
          {activeTab === 'enrollments' && (
            <>
              {user.enrollments.length === 0 ? (
                <div className="text-center py-8">
                  <GraduationCap className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">Nenhuma matrícula encontrada</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Curso</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Instituição</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Modalidade</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Valor</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Pagamento</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {user.enrollments.map((enrollment) => (
                        <tr key={enrollment.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">{enrollment.courseName}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{enrollment.institutionName}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 text-center">
                            {enrollment.modalidade}
                            {enrollment.turno && ` / ${enrollment.turno}`}
                          </td>
                          <td className="px-4 py-3 text-sm text-right">
                            {enrollment.finalPrice !== null ? (
                              <div>
                                <span className="text-gray-900 font-medium">{formatCurrency(enrollment.finalPrice)}</span>
                                {enrollment.originalPrice && enrollment.originalPrice !== enrollment.finalPrice && (
                                  <span className="text-xs text-gray-400 line-through ml-1">
                                    {formatCurrency(enrollment.originalPrice)}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusLabels[enrollment.status]?.color || 'bg-gray-100 text-gray-800'}`}>
                              {statusLabels[enrollment.status]?.label || enrollment.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${paymentStatusLabels[enrollment.paymentStatus]?.color || 'bg-gray-100 text-gray-800'}`}>
                              <CreditCard className="w-3 h-3" />
                              {paymentStatusLabels[enrollment.paymentStatus]?.label || enrollment.paymentStatus}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">{formatDate(enrollment.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* Favoritos Tab */}
          {activeTab === 'favorites' && (
            <>
              {user.favorites.length === 0 ? (
                <div className="text-center py-8">
                  <Heart className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">Nenhum favorito encontrado</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user.favorites.map((fav) => (
                    <div key={fav.id} className="border border-gray-200 rounded-lg p-4 hover:border-bolsa-primary/30 transition-colors">
                      <h4 className="font-medium text-gray-900">{fav.courseName}</h4>
                      {fav.institutionName && (
                        <p className="text-sm text-gray-500 mt-1">{fav.institutionName}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        {fav.modalidade && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{fav.modalidade}</span>
                        )}
                        {fav.price !== null && (
                          <span className="text-sm font-medium text-bolsa-primary">{formatCurrency(fav.price)}</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-2">Adicionado em {formatDate(fav.createdAt)}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Histórico de Buscas Tab */}
          {activeTab === 'history' && (
            <>
              {user.searchHistory.length === 0 ? (
                <div className="text-center py-8">
                  <Search className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">Nenhuma busca registrada</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {user.searchHistory.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap gap-2">
                          {item.query && (
                            <span className="text-sm text-gray-900">"{item.query}"</span>
                          )}
                          {item.course && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{item.course}</span>
                          )}
                          {item.city && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                              {item.city}{item.state ? `/${item.state}` : ''}
                            </span>
                          )}
                          {item.modalidade && (
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">{item.modalidade}</span>
                          )}
                          {item.nivel && (
                            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">{item.nivel}</span>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-gray-400 flex-shrink-0">{formatDateTime(item.createdAt)}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
