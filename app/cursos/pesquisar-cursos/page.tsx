import { redirect } from 'next/navigation'

export default function PesquisarCursosPage() {
  // Redirecionar para a página de resultados de cursos
  redirect('/curso/resultado')
}

