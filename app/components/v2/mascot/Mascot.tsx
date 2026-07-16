/**
 * Mascote oficial (livrinho) — wrapper tipado por pose.
 * Regras completas em docs/MASCOTES.md: 1 mascote por dobra, 64–240px,
 * sem distorção/recolor, alt="" quando decorativo ao lado de texto.
 */

import Image from 'next/image'

/**
 * Bob — mascote oficial (capivara estudante, biblioteca de 40 poses 3D).
 * Mapa completo pose→contexto em docs/MASCOTES.md.
 */
export type MascotPose =
  // postura & saudação
  | 'em-pe' | 'acenando' | 'joinha' | 'bracos-cruzados' | 'maos-na-cintura'
  | 'pulando' | 'correndo' | 'andando' | 'apontando'
  // estudo & conteúdo
  | 'sentado-lendo' | 'lendo' | 'escrevendo' | 'prova' | 'notebook' | 'tablet'
  | 'celular' | 'biblioteca' | 'professor' | 'explicando' | 'pesquisando'
  // emoções & momentos
  | 'cafe' | 'metas' | 'ideia' | 'pensando' | 'confuso' | 'surpreso'
  | 'comemorando' | 'dancando' | 'dormindo'
  // tecnologia
  | 'headset-notebook' | 'notebook-casual' | 'gamer' | 'programando'
  | 'digitando' | 'ia' | 'chat' | 'headset' | 'smartphone' | 'smartwatch'
  | 'tablet-sofa'
  // profissões (Bob por área de curso — medicina, direito, engenharias...)
  | 'medico' | 'enfermeiro' | 'advogado' | 'engenheiro' | 'psicologo'
  | 'pedagogo' | 'dentista' | 'chef'

export function mascotSrc(pose: MascotPose): string {
  return `/assets/mascote/3d/bob-${pose}.png`
}

export interface MascotProps {
  pose: MascotPose
  /** Lado do quadrado em px (o PNG é encaixado com object-contain). */
  size?: number
  /** "" (decorativo, default) ou descritivo quando for o único conteúdo visual. */
  alt?: string
  className?: string
  priority?: boolean
}

export default function Mascot({ pose, size = 120, alt = '', className = '', priority }: MascotProps) {
  return (
    <Image
      src={mascotSrc(pose)}
      alt={alt}
      width={size}
      height={size}
      priority={priority}
      className={`select-none object-contain ${className}`}
      draggable={false}
    />
  )
}
