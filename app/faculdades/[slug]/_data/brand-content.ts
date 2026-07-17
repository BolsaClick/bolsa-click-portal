// Conteúdo editorial ÚNICO por marca parceira (Fase 3 do SEO de marca).
//
// Regra anti-hallucination (CLAUDE.md): nada de preço, nota MEC ou estatística
// inventados. Os fatos aqui (fundação, grupo, polos, modalidades) espelham o que
// já está no seed `prisma/seed-institutions.ts` e são first-party. Preços NÃO são
// citados como número fixo — a mensalidade real vem da API na seção "Cursos com
// bolsa". Nota MEC citada só quando existe no seed (Pitágoras não tem → aponta o
// e-MEC). Cada marca tem texto próprio pra evitar conteúdo duplicado entre as 5
// brand pages.

export interface BrandPasso {
  titulo: string
  descricao: string
}

export interface BrandFaqItem {
  q: string
  a: string
}

export interface BrandContent {
  /** "Como conseguir bolsa na {marca}" — intro + 4 passos (conteúdo visível da página). */
  comoConseguir: {
    intro: string
    passos: BrandPasso[]
  }
  /** FAQ única da marca (substitui a FAQ templada — alimenta FAQPage JSON-LD). */
  faq: BrandFaqItem[]
  /** "{marca} vale a pena?" — veredito + pontos fortes + pra quem serve. */
  valeAPena: {
    veredito: string
    pontosFortes: string[]
    consideracoes: string
  }
}

export const BRAND_CONTENT: Record<string, BrandContent> = {
  anhanguera: {
    comoConseguir: {
      intro:
        'A Anhanguera trabalha com bolsas próprias em graduação, pós e cursos EAD, sem depender de ENEM nem de nota de corte. Pelo Bolsa Click você garante o desconto antes de se matricular — em qualquer um dos mais de 70 polos ou 100% online.',
      passos: [
        {
          titulo: 'Busque o curso na Anhanguera',
          descricao:
            'Pesquise pelo curso que você quer (Administração, Enfermagem, ADS, Pedagogia e mais de 400 outros) e filtre pela Anhanguera. Dá pra escolher EAD, presencial ou semipresencial.',
        },
        {
          titulo: 'Compare as ofertas com bolsa',
          descricao:
            'Veja a mensalidade original e a mensalidade com bolsa lado a lado, além do polo mais perto de você. Os descontos da Anhanguera chegam a 80%, maiores no EAD.',
        },
        {
          titulo: 'Cadastre-se grátis',
          descricao:
            'Preencha seus dados no Bolsa Click sem custo e sem prova. A bolsa fica reservada — você não paga nada pra garantir o desconto.',
        },
        {
          titulo: 'Faça a matrícula com a bolsa aplicada',
          descricao:
            'Finalize a matrícula direto com a Anhanguera já pagando a mensalidade com desconto. Na maioria dos cursos o vestibular é online e a aprovação sai em poucas horas.',
        },
      ],
    },
    faq: [
      {
        q: 'Qual a nota da Anhanguera no MEC?',
        a: 'A Anhanguera tem Conceito Institucional 3 no MEC (escala de 1 a 5). Cada curso também recebe uma nota própria (CC/CPC), que você pode conferir no portal e-MEC antes de se matricular.',
      },
      {
        q: 'Como conseguir bolsa na Anhanguera sem ENEM?',
        a: 'As bolsas próprias da Anhanguera não exigem nota do ENEM nem nota de corte. Basta buscar o curso no Bolsa Click, escolher a oferta com desconto e se cadastrar grátis — o ingresso é por vestibular online ou análise do histórico.',
      },
      {
        q: 'A Anhanguera é EAD ou presencial?',
        a: 'As duas. A Anhanguera tem mais de 70 polos presenciais pelo Brasil e uma das maiores estruturas de EAD do país, com graduação semipresencial e 100% online. Você escolhe a modalidade na hora de comparar as ofertas.',
      },
      {
        q: 'Quanto custa a mensalidade da Anhanguera com bolsa?',
        a: 'Depende do curso, da modalidade e do polo. Com a bolsa aplicada pelo Bolsa Click o desconto chega a 80% sobre o valor cheio — os cursos EAD costumam ter as mensalidades mais baixas. Veja os valores reais de cada curso na seção de ofertas acima.',
      },
      {
        q: 'O diploma da Anhanguera é reconhecido?',
        a: 'Sim. A Anhanguera é credenciada pelo MEC e o diploma de graduação tem a mesma validade nacional de qualquer faculdade, inclusive nos cursos EAD. Ela pertence ao grupo Cogna Educação, o maior grupo educacional privado do país.',
      },
    ],
    valeAPena: {
      veredito:
        'A Anhanguera vale a pena principalmente por escala e alcance: é uma das maiores redes do Brasil, com presença em quase todo estado e um catálogo enorme de cursos com bolsa.',
      pontosFortes: [
        'Mais de 70 polos presenciais + EAD de cobertura nacional — provavelmente há uma unidade perto de você',
        'Catálogo com mais de 400 cursos de graduação e pós',
        'Estrutura do grupo Cogna, com plataforma de ensino consolidada e ferramentas de empregabilidade',
        'Bolsas de até 80% sem ENEM e sem nota de corte',
      ],
      consideracoes:
        'O Conceito Institucional 3 no MEC é intermediário — então vale checar a nota específica do curso que você quer no e-MEC, já que ela varia bastante entre as graduações. É uma boa escolha pra quem prioriza preço baixo, flexibilidade e capilaridade de polos.',
    },
  },

  unopar: {
    comoConseguir: {
      intro:
        'A Unopar é referência em EAD no Brasil e tem a maior rede de polos de apoio presencial do país — mais de 750. As bolsas próprias funcionam sem ENEM; pelo Bolsa Click você reserva o desconto antes da matrícula.',
      passos: [
        {
          titulo: 'Escolha o curso na Unopar',
          descricao:
            'Busque o curso desejado e filtre pela Unopar. O forte da instituição é o EAD e o semipresencial, com apoio no polo mais próximo pra provas e atividades práticas.',
        },
        {
          titulo: 'Compare mensalidade e polo de apoio',
          descricao:
            'Veja o desconto aplicado sobre o valor cheio e confira qual dos mais de 750 polos fica perto de você. As bolsas da Unopar chegam a 80%.',
        },
        {
          titulo: 'Faça o cadastro gratuito',
          descricao:
            'Cadastre-se no Bolsa Click sem pagar nada. A oferta com bolsa fica garantida e o ingresso é por vestibular online ou histórico escolar.',
        },
        {
          titulo: 'Matricule-se com o desconto',
          descricao:
            'Conclua a matrícula com a Unopar já com a mensalidade reduzida. Você começa a estudar online e usa o polo apenas quando precisar.',
        },
      ],
    },
    faq: [
      {
        q: 'Qual a nota da Unopar no MEC?',
        a: 'A Unopar (Universidade Norte do Paraná) tem Conceito Institucional 3 no MEC. Por ser universidade, tem autonomia pra criar cursos — a nota de cada graduação pode ser conferida no e-MEC.',
      },
      {
        q: 'A Unopar é boa para EAD?',
        a: 'A Unopar é uma das pioneiras e maiores em EAD no Brasil, com mais de 750 polos de apoio presencial — a maior rede física de suporte a alunos a distância do país. É referência justamente pela combinação de estudo online com atendimento presencial no polo.',
      },
      {
        q: 'Como conseguir bolsa na Unopar?',
        a: 'Busque o curso no Bolsa Click, filtre pela Unopar, compare as ofertas com desconto e cadastre-se de graça. As bolsas próprias não exigem ENEM e o desconto chega a 80% na mensalidade.',
      },
      {
        q: 'Preciso ir ao polo da Unopar?',
        a: 'Nos cursos EAD e semipresenciais, o polo é usado principalmente para provas e algumas atividades práticas — o restante é online. Com mais de 750 polos, geralmente há um próximo da sua cidade. Você confere qual atende sua região ao comparar as ofertas.',
      },
      {
        q: 'O diploma da Unopar EAD vale o mesmo que o presencial?',
        a: 'Sim. O diploma de um curso EAD credenciado pelo MEC tem exatamente a mesma validade nacional que o de um curso presencial. A Unopar integra o grupo Cogna Educação e seus cursos são reconhecidos pelo MEC.',
      },
    ],
    valeAPena: {
      veredito:
        'A Unopar vale a pena pra quem quer estudar a distância com respaldo presencial: é a maior rede de polos de EAD do Brasil e uma marca consolidada há mais de 50 anos.',
      pontosFortes: [
        'Mais de 750 polos de apoio — a maior cobertura presencial de EAD do país',
        'Status de universidade (fundada em 1972), com tradição e autonomia acadêmica',
        'Metodologia de EAD madura, pensada pra quem concilia trabalho e estudo',
        'Bolsas próprias de até 80% sem exigência de ENEM',
      ],
      consideracoes:
        'O Conceito Institucional 3 é intermediário, então confira a nota do curso específico no e-MEC. A Unopar faz mais sentido pra quem vai de EAD/semipresencial e valoriza ter um polo físico por perto — quem busca curso 100% presencial em campus tradicional pode ter opções mais limitadas.',
    },
  },

  pitagoras: {
    comoConseguir: {
      intro:
        'A Pitágoras é uma das instituições mais antigas do grupo Cogna, com forte presença em Minas Gerais e cursos EAD em todo o país. As bolsas próprias dispensam ENEM — pelo Bolsa Click você garante o desconto antes de fechar a matrícula.',
      passos: [
        {
          titulo: 'Encontre o curso na Pitágoras',
          descricao:
            'Pesquise o curso desejado e filtre pela Pitágoras. Há opções presenciais, semipresenciais e EAD em graduação e pós-graduação.',
        },
        {
          titulo: 'Compare as ofertas com bolsa',
          descricao:
            'Confira a mensalidade com desconto e a modalidade de cada oferta. As bolsas da Pitágoras chegam a 80%, com os menores valores geralmente no EAD.',
        },
        {
          titulo: 'Cadastre-se sem custo',
          descricao:
            'Faça seu cadastro grátis no Bolsa Click. A bolsa fica reservada e o ingresso é por vestibular online ou análise de histórico — sem nota de corte.',
        },
        {
          titulo: 'Conclua a matrícula com desconto',
          descricao:
            'Finalize direto com a Pitágoras pagando a mensalidade já com a bolsa aplicada e comece a estudar.',
        },
      ],
    },
    faq: [
      {
        q: 'Qual a nota da Pitágoras no MEC?',
        a: 'A nota institucional e a nota de cada curso da Pitágoras devem ser consultadas diretamente no portal e-MEC, que é a fonte oficial do MEC. Lá você vê o Conceito de cada graduação antes de decidir.',
      },
      {
        q: 'A Pitágoras é uma faculdade tradicional?',
        a: 'Sim. A Pitágoras nasceu em 1966 em Belo Horizonte e é uma das marcas educacionais mais antigas do país, hoje parte do grupo Cogna Educação. Tem forte presença em Minas Gerais e oferece cursos EAD para todo o Brasil.',
      },
      {
        q: 'Como conseguir bolsa na Pitágoras?',
        a: 'Busque o curso no Bolsa Click, filtre pela Pitágoras e compare as ofertas com desconto. O cadastro é gratuito, as bolsas próprias não exigem ENEM e o desconto chega a 80% na mensalidade.',
      },
      {
        q: 'A Pitágoras tem cursos EAD?',
        a: 'Sim. Além dos cursos presenciais e semipresenciais, a Pitágoras oferece graduação e pós EAD com diploma reconhecido pelo MEC, permitindo estudar de qualquer cidade com apoio de polo quando necessário.',
      },
      {
        q: 'Quanto custa estudar na Pitágoras?',
        a: 'A mensalidade varia por curso e modalidade. Com a bolsa aplicada pelo Bolsa Click o desconto chega a 80% sobre o valor cheio. Veja os valores reais de cada curso disponível na seção de ofertas acima.',
      },
    ],
    valeAPena: {
      veredito:
        'A Pitágoras vale a pena pela tradição e pelo custo acessível, especialmente em Minas Gerais e no EAD — é uma marca com mais de 50 anos dentro de um dos maiores grupos educacionais do Brasil.',
      pontosFortes: [
        'Uma das instituições mais antigas do país (desde 1966), com marca consolidada',
        'Forte presença presencial em Minas Gerais + EAD de alcance nacional',
        'Estrutura e plataforma do grupo Cogna Educação',
        'Bolsas próprias de até 80% sem ENEM e sem nota de corte',
      ],
      consideracoes:
        'Como as notas MEC variam por curso e a fonte oficial é o e-MEC, vale conferir lá o Conceito da graduação específica antes de decidir. A Pitágoras é uma boa escolha pra quem está em Minas ou quer EAD com uma marca de longa trajetória.',
    },
  },

  unime: {
    comoConseguir: {
      intro:
        'A Unime concentra sua estrutura presencial na Bahia e complementa com EAD para todo o país. As bolsas próprias funcionam sem ENEM — pelo Bolsa Click você reserva o desconto antes de se matricular.',
      passos: [
        {
          titulo: 'Busque o curso na Unime',
          descricao:
            'Pesquise o curso desejado e filtre pela Unime. As unidades presenciais estão concentradas na região metropolitana de Salvador, e há opções EAD e semipresenciais.',
        },
        {
          titulo: 'Compare as ofertas com bolsa',
          descricao:
            'Veja a mensalidade com desconto e a modalidade de cada oferta. As bolsas da Unime chegam a 80% sobre o valor cheio.',
        },
        {
          titulo: 'Faça o cadastro gratuito',
          descricao:
            'Cadastre-se no Bolsa Click sem custo. A oferta com bolsa fica garantida e o ingresso é por vestibular online ou histórico, sem nota de corte.',
        },
        {
          titulo: 'Matricule-se com a bolsa',
          descricao:
            'Finalize a matrícula direto com a Unime já com a mensalidade reduzida e comece a estudar.',
        },
      ],
    },
    faq: [
      {
        q: 'Qual a nota da Unime no MEC?',
        a: 'A Unime tem Conceito Institucional 4 no MEC (escala de 1 a 5), uma das melhores entre as instituições parceiras. A nota de cada curso pode ser conferida no portal e-MEC.',
      },
      {
        q: 'Onde ficam as unidades da Unime?',
        a: 'A Unime tem sua estrutura presencial concentrada na Bahia, principalmente na região metropolitana de Salvador (a sede fica em Lauro de Freitas). Para quem está fora do estado, há a opção de cursos EAD com diploma reconhecido pelo MEC.',
      },
      {
        q: 'Como conseguir bolsa na Unime?',
        a: 'Busque o curso no Bolsa Click, filtre pela Unime e compare as ofertas com desconto. O cadastro é grátis, as bolsas próprias não exigem ENEM e o desconto chega a 80% na mensalidade.',
      },
      {
        q: 'A Unime é uma boa faculdade?',
        a: 'A Unime tem Conceito Institucional 4 no MEC, acima da média das faculdades particulares, e integra o grupo Cogna Educação. É especialmente reconhecida na Bahia, onde concentra suas unidades presenciais.',
      },
      {
        q: 'Quanto custa a mensalidade da Unime com bolsa?',
        a: 'O valor depende do curso e da modalidade. Com a bolsa aplicada pelo Bolsa Click o desconto chega a 80% sobre o valor cheio. Confira as mensalidades reais de cada curso na seção de ofertas acima.',
      },
    ],
    valeAPena: {
      veredito:
        'A Unime vale a pena principalmente na Bahia e para quem valoriza nota MEC: tem Conceito Institucional 4, um dos mais altos entre as parceiras, com o respaldo do grupo Cogna.',
      pontosFortes: [
        'Conceito Institucional 4 no MEC — acima da média das particulares',
        'Referência presencial na região metropolitana de Salvador',
        'Opção de EAD com diploma reconhecido para quem está fora da Bahia',
        'Bolsas próprias de até 80% sem exigência de ENEM',
      ],
      consideracoes:
        'A presença presencial da Unime é regional (concentrada na Bahia), então fora do estado o caminho natural é o EAD. Para quem está em Salvador e região e quer uma instituição bem avaliada pelo MEC com mensalidade acessível, é uma das melhores opções entre as parceiras.',
    },
  },

  estacio: {
    comoConseguir: {
      intro:
        'A Estácio é uma das maiores redes do país, do grupo YDUQS, com campus presenciais em todas as regiões e uma estrutura de EAD de grande porte. As bolsas próprias dispensam ENEM — pelo Bolsa Click você garante o desconto antes da matrícula.',
      passos: [
        {
          titulo: 'Escolha o curso na Estácio',
          descricao:
            'Busque o curso desejado e filtre pela Estácio. São mais de 500 cursos entre graduação e pós, em modalidade presencial, semipresencial e EAD.',
        },
        {
          titulo: 'Compare as ofertas com bolsa',
          descricao:
            'Veja a mensalidade original e a com bolsa lado a lado, além do campus ou polo mais próximo. Os descontos da Estácio chegam a 80%.',
        },
        {
          titulo: 'Cadastre-se grátis',
          descricao:
            'Faça seu cadastro no Bolsa Click sem custo. A bolsa fica reservada e o ingresso é por vestibular online, ENEM (opcional) ou análise de histórico.',
        },
        {
          titulo: 'Conclua a matrícula com desconto',
          descricao:
            'Finalize direto com a Estácio já pagando a mensalidade com a bolsa aplicada e comece a estudar.',
        },
      ],
    },
    faq: [
      {
        q: 'Qual a nota da Estácio no MEC?',
        a: 'A Estácio tem Conceito Institucional 4 no MEC (escala de 1 a 5). Cada curso recebe uma avaliação própria (CC/CPC), que pode ser consultada no portal e-MEC antes da matrícula.',
      },
      {
        q: 'A Estácio é presencial ou EAD?',
        a: 'As duas. A Estácio tem cerca de 100 campus e polos presenciais espalhados por todas as regiões do Brasil e também uma grande estrutura de EAD. Você escolhe presencial, semipresencial ou 100% online ao comparar as ofertas.',
      },
      {
        q: 'Como conseguir bolsa na Estácio sem ENEM?',
        a: 'As bolsas próprias da Estácio não exigem ENEM nem nota de corte. Basta buscar o curso no Bolsa Click, escolher a oferta com desconto e se cadastrar de graça — o ingresso pode ser por vestibular online ou histórico escolar.',
      },
      {
        q: 'A Estácio faz parte de qual grupo?',
        a: 'A Estácio integra o grupo YDUQS, um dos maiores grupos de educação superior do Brasil (diferente das marcas Anhanguera, Unopar e Pitágoras, que são do grupo Cogna). É uma instituição tradicional, fundada em 1970 no Rio de Janeiro.',
      },
      {
        q: 'Quanto custa a mensalidade da Estácio com bolsa?',
        a: 'O valor varia por curso, campus e modalidade. Com a bolsa do Bolsa Click o desconto chega a 80% sobre o valor cheio, e os cursos EAD tendem a ter as mensalidades mais baixas. Veja os valores reais na seção de ofertas acima.',
      },
    ],
    valeAPena: {
      veredito:
        'A Estácio vale a pena pela combinação de escala, presença presencial forte e boa nota MEC: Conceito Institucional 4, campus em todas as regiões e um dos maiores catálogos de cursos do país.',
      pontosFortes: [
        'Conceito Institucional 4 no MEC — acima da média das particulares',
        'Cerca de 100 campus e polos presenciais em todas as regiões',
        'Mais de 500 cursos entre graduação e pós, presencial e EAD',
        'Bolsas de até 80% sem ENEM, com aceitação opcional da nota do ENEM',
      ],
      consideracoes:
        'Por ser uma rede muito grande, a experiência pode variar de campus pra campus — vale conferir a nota do curso específico no e-MEC. É uma escolha sólida pra quem quer faculdade presencial de marca conhecida com boa cobertura nacional, ou EAD de uma instituição bem avaliada.',
    },
  },
}
