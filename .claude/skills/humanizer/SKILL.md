---
name: humanizer
description: Remove "cara de IA" de um texto já escrito: travessão, jargão robótico, paralelismo negativo forçado, voz passiva excessiva, ritmo de frase repetitivo. Skill de apoio, reusável por qualquer conteúdo do repo, não só a skill blog-post.
---

# humanizer

Skill de apoio pra revisar texto já escrito e tirar os tiques que
denunciam texto gerado por IA sem revisão. Não escreve do zero: pega um
rascunho e ajusta. Usada pela skill `blog-post` (Passo 4), mas serve pra
qualquer texto do repo (email, copy de landing, descrição de produto).

## O que eliminar

### Pontuação

- **Travessão** (— ou –) em qualquer posição. Trocar por vírgula, ponto,
  dois-pontos ou reescrever a frase. Isso é regra fixa do tom de voz do
  Bolsa Click (ver `docs/DNA.md`), não só preferência de estilo.

### Jargão de IA (lista não exaustiva, mas é o núcleo do problema)

Frases e expressões que soam natural pra um modelo de linguagem mas
nenhuma pessoa real usa em texto informativo:

- "no cenário atual", "no cenário de hoje"
- "vale ressaltar que", "é importante notar que", "cabe destacar que"
- "em suma", "em síntese", "concluindo"
- "mergulhe em", "mergulhar fundo em"
- "desbloqueie", "destrave"
- "eleve", "elevar o nível de"
- "landscape" (usado fora de contexto, tipo "no landscape educacional")
- "jornada" usado genericamente ("a jornada de aprendizado") quando
  "processo" ou nada resolveria melhor
- "não é apenas sobre X, é sobre Y" e qualquer variante desse molde

Se encontrar uma dessas (ou uma nova que soe no mesmo registro), reescreva
a frase inteira. Não só troque a palavra por sinônimo: o problema é o
padrão de frase, não o vocabulário isolado.

### Paralelismo negativo forçado

Padrão "não é só X, é Y" (e variantes "não se trata de X, mas de Y") é um
tique reconhecível de texto gerado por IA quando aparece mais de 1 vez no
mesmo texto, ou mesmo 1 vez num texto curto. Reescreva como afirmação
direta.

> Errado: "A bolsa não é só um desconto, é uma oportunidade de mudar de
> vida."
>
> Melhor: "A bolsa reduz a mensalidade em até 78%, o suficiente pra
> viabilizar a faculdade pra quem não conseguiria pagar o valor cheio."

### Voz passiva excessiva

Português já usa menos voz passiva que inglês; texto gerado por IA tende a
usar mais do que o natural. Prefira voz ativa quando o sujeito da ação for
claro.

> Passiva: "A documentação deve ser entregue pelo candidato no prazo
> estabelecido pela instituição."
>
> Ativa: "O candidato entrega a documentação no prazo que a instituição
> define."

### Ritmo de frase repetitivo

Texto de IA sem revisão tende a ter frases todas do mesmo tamanho e
estrutura (sujeito-verbo-objeto, sujeito-verbo-objeto, sujeito-verbo-
objeto). Varie: intercale frase curta com frase mais longa, comece
alguma frase com advérbio ou oração subordinada em vez de sempre o
sujeito.

## Como aplicar

1. Releia o texto inteiro.
2. Busque e elimine cada travessão.
3. Busque e reescreva cada ocorrência da lista de jargão de IA.
4. Busque e reescreva paralelismo negativo forçado.
5. Marque frases em voz passiva onde o sujeito é claro e reescreva em
   voz ativa.
6. Releia em voz alta (mentalmente): se 3+ frases seguidas têm a mesma
   estrutura, reescreva pra variar o ritmo.
7. Releia o resultado final inteiro. Confirme que ainda soa natural.
   Correção em excesso (frases muito curtas e picotadas, por exemplo)
   também soa artificial, na direção oposta.
