// 20 afirmações Likert (escala 1-5) organizadas em 3 capítulos.
// Cada questão pesa positivamente em 1-2 dimensões RIASEC e 1-2 inteligências Gardner.
// Quando o usuário marca 5 (concordo totalmente), soma peso máximo.

import type { RiasecType, GardnerIntelligence } from './methodology-profiles'

export interface LikertQuestion {
  id: number
  chapter: number              // 1, 2 ou 3
  text: string
  // Cada questão contribui pra esses pesos (multiplicados pela resposta 1-5):
  riasecWeights: Partial<Record<RiasecType, number>>
  gardnerWeights: Partial<Record<GardnerIntelligence, number>>
}

export const CHAPTERS = [
  { id: 1, title: 'Sobre você', subtitle: 'Como você se identifica' },
  { id: 2, title: 'Seu jeito de trabalhar', subtitle: 'O ambiente em que você floresce' },
  { id: 3, title: 'O que te move', subtitle: 'Valores, interesses e motivações' },
] as const

export const QUESTIONS: LikertQuestion[] = [
  // ===== Capítulo 1: Sobre você =====
  {
    id: 1, chapter: 1,
    text: 'Eu me sinto energizado quando estou cercado de pessoas conversando.',
    riasecWeights: { S: 2, E: 1 },
    gardnerWeights: { interpessoal: 2 },
  },
  {
    id: 2, chapter: 1,
    text: 'Gosto de mexer com ferramentas, consertar coisas ou trabalhar com as mãos.',
    riasecWeights: { R: 2 },
    gardnerWeights: { 'corporal-cinestesica': 2 },
  },
  {
    id: 3, chapter: 1,
    text: 'Costumo questionar o porquê das coisas, mesmo quando todo mundo já aceitou a resposta.',
    riasecWeights: { I: 2 },
    gardnerWeights: { 'logico-matematica': 1, intrapessoal: 1 },
  },
  {
    id: 4, chapter: 1,
    text: 'Tenho mais facilidade pra me expressar criando algo (texto, desenho, vídeo) do que falando direto.',
    riasecWeights: { A: 2 },
    gardnerWeights: { linguistica: 1, espacial: 1 },
  },
  {
    id: 5, chapter: 1,
    text: 'Quando vejo desorganização, sinto vontade de arrumar e criar um sistema.',
    riasecWeights: { C: 2 },
    gardnerWeights: { 'logico-matematica': 1 },
  },
  {
    id: 6, chapter: 1,
    text: 'Sinto satisfação real quando lidero um grupo em direção a um objetivo.',
    riasecWeights: { E: 2, S: 1 },
    gardnerWeights: { interpessoal: 2 },
  },
  {
    id: 7, chapter: 1,
    text: 'Tenho consciência clara dos meus próprios sentimentos e do que me motiva.',
    riasecWeights: { S: 1, A: 1 },
    gardnerWeights: { intrapessoal: 2 },
  },

  // ===== Capítulo 2: Seu jeito de trabalhar =====
  {
    id: 8, chapter: 2,
    text: 'Prefiro trabalhar sozinho em uma sala silenciosa do que em grupo barulhento.',
    riasecWeights: { I: 1, C: 1 },
    gardnerWeights: { intrapessoal: 1 },
  },
  {
    id: 9, chapter: 2,
    text: 'Me dou bem com rotinas previsíveis e tarefas que se repetem.',
    riasecWeights: { C: 2, R: 1 },
    gardnerWeights: {},
  },
  {
    id: 10, chapter: 2,
    text: 'Prefiro trabalhar com tarefas variadas, sem saber exatamente o que vai aparecer no dia.',
    riasecWeights: { A: 2, E: 1 },
    gardnerWeights: {},
  },
  {
    id: 11, chapter: 2,
    text: 'Me motiva quando consigo ajudar uma pessoa que tava em dificuldade.',
    riasecWeights: { S: 2 },
    gardnerWeights: { interpessoal: 1, intrapessoal: 1 },
  },
  {
    id: 12, chapter: 2,
    text: 'Curto trabalho que exige análise profunda de dados, números ou padrões.',
    riasecWeights: { I: 2, C: 1 },
    gardnerWeights: { 'logico-matematica': 2 },
  },
  {
    id: 13, chapter: 2,
    text: 'Me imagino feliz em ambiente ao ar livre, com plantas, animais ou ciência da natureza.',
    riasecWeights: { R: 1, I: 1 },
    gardnerWeights: { naturalista: 2 },
  },
  {
    id: 14, chapter: 2,
    text: 'Gostaria de um trabalho em que eu possa me movimentar bastante, não ficar 8h sentado.',
    riasecWeights: { R: 2, S: 1 },
    gardnerWeights: { 'corporal-cinestesica': 2 },
  },

  // ===== Capítulo 3: O que te move =====
  {
    id: 15, chapter: 3,
    text: 'Pra mim, fazer algo que tem impacto direto na vida das pessoas é mais importante do que ganhar muito dinheiro.',
    riasecWeights: { S: 2 },
    gardnerWeights: { intrapessoal: 1, interpessoal: 1 },
  },
  {
    id: 16, chapter: 3,
    text: 'Tenho ideias frequentes pra produtos, negócios ou jeitos novos de fazer coisas.',
    riasecWeights: { E: 2, A: 1 },
    gardnerWeights: { interpessoal: 1, linguistica: 1 },
  },
  {
    id: 17, chapter: 3,
    text: 'Sinto fascínio por entender o corpo humano, biologia ou medicina.',
    riasecWeights: { I: 2, S: 1 },
    gardnerWeights: { naturalista: 1, 'logico-matematica': 1 },
  },
  {
    id: 18, chapter: 3,
    text: 'Curto debater, argumentar e convencer pessoas de pontos de vista.',
    riasecWeights: { E: 1, S: 1, A: 1 },
    gardnerWeights: { linguistica: 2, interpessoal: 1 },
  },
  {
    id: 19, chapter: 3,
    text: 'Me interesso por como funciona tecnologia, software, lógica de programação ou sistemas.',
    riasecWeights: { I: 2, C: 1, R: 1 },
    gardnerWeights: { 'logico-matematica': 2, espacial: 1 },
  },
  {
    id: 20, chapter: 3,
    text: 'Sinto satisfação em montar planejamento financeiro, planilhas e controlar resultados.',
    riasecWeights: { C: 2, E: 1 },
    gardnerWeights: { 'logico-matematica': 2 },
  },
]
