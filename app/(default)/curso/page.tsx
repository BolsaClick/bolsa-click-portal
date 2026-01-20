import { redirect } from 'next/navigation'

export default function CursoPage() {
  // Redirecionar permanentemente para a homepage onde está o filtro de busca
  redirect('/curso/resultado')
}

