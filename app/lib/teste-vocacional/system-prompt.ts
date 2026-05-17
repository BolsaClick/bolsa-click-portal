import { TOP_CURSOS } from '@/app/cursos/_data/cursos'
import { RIASEC_DESCRIPTIONS, GARDNER_DESCRIPTIONS, type RiasecType, type GardnerIntelligence } from './methodology-profiles'
import type { UserProfile } from './matching'

const COURSE_CATALOG = TOP_CURSOS.map(c => `- ${c.apiCourseName} (slug: ${c.slug})`).join('\n')

// System prompt pro refinamento conversacional curto (2-3 turnos)
// AI recebe perfil determinístico (já calculado) + faz perguntas abertas pra cobrir
// nuance e gerar reasoning personalizado. NÃO menciona RIASEC pro user.
export function buildRefinementPrompt(profile: UserProfile): string {
  const primaryName = RIASEC_DESCRIPTIONS[profile.primary].name
  const secondaryName = RIASEC_DESCRIPTIONS[profile.secondary].name
  const tertiaryName = RIASEC_DESCRIPTIONS[profile.tertiary].name
  const topIntels = profile.topIntelligences
    .map(i => GARDNER_DESCRIPTIONS[i].name)
    .join(', ')

  return `Você é conselheiro vocacional brasileiro do Bolsa Click. O usuário acabou de responder 20 perguntas Likert que indicam o perfil dele.

PERFIL EMERGENTE (não compartilhe com o usuário — use só pra guiar suas perguntas):
- Tipos Holland dominantes: ${primaryName} > ${secondaryName} > ${tertiaryName}
- Inteligências dominantes: ${topIntels}

SUA MISSÃO:
- Fazer 2 ou 3 perguntas abertas pra capturar nuance que escala Likert não pega
- Foco: contextos reais, exemplos concretos, situações que energizam ou drenam o usuário
- Cada pergunta deve ser uma só, curta (1-2 linhas)

REGRAS:
- Português brasileiro informal mas profissional. Use "você".
- NÃO mencione RIASEC, Holland, Gardner, "tipo", "perfil" — fica tudo invisível.
- NÃO recomende cursos durante a conversa.
- Sua primeira mensagem: saudação curta + primeira pergunta aberta personalizada pro perfil.
  Ex: "Suas respostas mostraram bastante traço de gente que gosta de [algo do tipo dominante]. Me conta uma situação real em que você se sentiu super engajado profissionalmente."
- Após 2-3 turnos, encerre EXATAMENTE com: "Acho que já tenho o suficiente pra te dar uma recomendação personalizada! Pra você ver sua trilha, vou precisar só dos seus dados."

ESTILO:
- Mensagens curtas (1-3 linhas).
- Sem emojis em excesso.
- Empático, sem tom corporativo.

CURSOS DO CATÁLOGO (pra você ter contexto, mas NÃO mencione agora):
${COURSE_CATALOG}`
}

// Schema final pra structured output das recomendações
// Holland Code já vem computado (deterministic) — AI só personaliza reasoning
export const RECOMMENDATIONS_SCHEMA = {
  type: 'json_schema' as const,
  json_schema: {
    name: 'vocational_recommendations',
    strict: true,
    schema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        recommendations: {
          type: 'array',
          minItems: 3,
          maxItems: 3,
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['courseSlug', 'matchPercent', 'reasoning'],
            properties: {
              courseSlug: {
                type: 'string',
                description: 'Slug do curso (deve estar na lista fornecida).',
              },
              matchPercent: {
                type: 'integer',
                minimum: 50,
                maximum: 100,
                description: 'Porcentagem de match (50-100) refinada com base no perfil + conversa.',
              },
              reasoning: {
                type: 'string',
                description:
                  '2-3 frases em PT-BR explicando por que esse curso combina, citando coisas concretas que o usuário disse na conversa aberta.',
              },
            },
          },
        },
      },
      required: ['recommendations'],
    },
  },
}

export function buildFinalRecommendationsPrompt(
  profile: UserProfile,
  topCourseSlugs: string[]
): string {
  const primaryName = RIASEC_DESCRIPTIONS[profile.primary].name
  const secondaryName = RIASEC_DESCRIPTIONS[profile.secondary].name
  const intels = profile.topIntelligences.map(i => GARDNER_DESCRIPTIONS[i].name).join(', ')

  return `Baseado no perfil (${primaryName} > ${secondaryName}, com inteligências dominantes em ${intels}) e na conversa acima, refine a recomendação para os cursos:

${topCourseSlugs.join(', ')}

Pra cada um dos 3 cursos: ajuste o matchPercent (50-100) e escreva 2-3 frases citando exatamente o que o usuário disse na conversa. Use os 3 slugs fornecidos, NÃO sugira outros.`
}

// Re-export para conveniência (compatibilidade)
export type { RiasecType, GardnerIntelligence }
