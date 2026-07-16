import type { MascotPose } from './Mascot'

/**
 * Mapa área de curso → pose do Bob (docs/MASCOTES.md, seção "Bob por profissão").
 * Casamento por palavra-chave no nome/slug do curso, sem acentos.
 * Fallback: 'professor' (contexto educacional neutro).
 */
const AREA_RULES: Array<[RegExp, MascotPose]> = [
  [/medicin|biomedicin/, 'medico'],
  [/enfermag/, 'enfermeiro'],
  [/direito/, 'advogado'],
  [/engenharia|arquitetura/, 'engenheiro'],
  [/psicolog/, 'psicologo'],
  [/pedagog|licenciatura|letras/, 'pedagogo'],
  [/odontolog/, 'dentista'],
  [/gastronom|nutric/, 'chef'],
  [/sistema|computac|software|ciencia de dados|tecnologia da informacao|analise e desenvolvimento|redes de comput|jogos digitais/, 'programando'],
  [/administrac|gestao|marketing|contabe|recursos humanos|logistic|financ/, 'metas'],
]

function normaliza(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/-/g, ' ')
}

export function courseAreaPose(nameOrSlug: string): MascotPose {
  const alvo = normaliza(nameOrSlug)
  for (const [re, pose] of AREA_RULES) {
    if (re.test(alvo)) return pose
  }
  return 'professor'
}
