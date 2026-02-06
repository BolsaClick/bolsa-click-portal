import { OfferDetails } from "./get-offer-details";
import { tartarus } from "./axios";

export interface MarketplaceInscriptionData {
  // Dados pessoais do formulário
  name: string;
  cpf: string;
  email: string;
  phone: string;
  rg?: string;
  birthDate: string; // formato: YYYY-MM-DD
  gender: "masculino" | "feminino" | "outro";
  // Endereço
  cep: string;
  address: string;
  addressNumber: string;
  neighborhood: string;
  city: string;
  state: string;
  // Tipo de ingresso: ENEM ou VESTIBULAR
  ingressType: "ENEM" | "VESTIBULAR";
  // Protocolo ENEM (obrigatório se ingressType === 'ENEM')
  enemProtocol?: string;
  // Ano de conclusão do ensino médio
  schoolYear: string;
  // Aceites
  acceptTerms?: boolean;
  acceptEmail?: boolean;
  acceptSms?: boolean;
  acceptWhatsapp?: boolean;
}

export interface MarketplaceInscriptionPayload {
  inscricao: {
    enem: {
      utilizar: boolean;
      protocolo?: string;
    };
    anoConclusao: number;
    aceiteTermo: boolean;
    aceitaReceberEmail: boolean;
    aceitaReceberSMS: boolean;
    aceitaReceberWhatsApp: boolean;
    ofertas: {
      primeiraOpcao: {
        idDMH: string;
      };
    };
    canalVendas: {
      id: number;
    };
    idTipoProva: number;
  };
  dadosPessoais: {
    nome: string;
    cpf: string;
    sexo: string;
    rg: string;
    dataNascimento: string;
    email: string;
    celular: string;
    endereco: {
      logradouro: string;
      numero: string;
      bairro: string;
      cep: string;
      uf: string;
      municipio: string;
    };
  };
}

/**
 * Cria inscrição no marketplace ATHENAS após pagamento confirmado
 * @param formData - Dados do formulário de checkout
 * @param offerDetails - Detalhes da oferta
 * @returns Resposta da API
 */
export async function createMarketplaceInscription(
  formData: MarketplaceInscriptionData,
  offerDetails: OfferDetails,
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  try {
    // Validar se temos o idDmhElastic
    if (!offerDetails.idDmhElastic) {
      console.error("❌ idDmhElastic não encontrado na oferta");
      return { success: false, error: "idDmhElastic não encontrado na oferta" };
    }

    // Mapear gênero para formato da API
    const genderMap: Record<string, string> = {
      masculino: "M",
      feminino: "F",
      outro: "O",
    };

    // Formatar CPF (apenas números)
    const cleanCpf = formData.cpf.replace(/\D/g, "");
    const formattedCpf = cleanCpf.replace(
      /(\d{3})(\d{3})(\d{3})(\d{2})/,
      "$1.$2.$3-$4",
    );

    // Formatar CEP
    const cleanCep = formData.cep.replace(/\D/g, "");
    const formattedCep = cleanCep.replace(/(\d{5})(\d{3})/, "$1-$2");

    // Formatar telefone (apenas números)
    const cleanPhone = formData.phone.replace(/\D/g, "");

    // Formatar data de nascimento para YYYY-MM-DD
    // O formulário envia no formato DD-MM-YYYY, a API espera YYYY-MM-DD
    const formatBirthDate = (dateStr: string): string => {
      // Se já está no formato YYYY-MM-DD, retorna como está
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return dateStr;
      }
      // Se está no formato DD-MM-YYYY, converte para YYYY-MM-DD
      if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
        const [day, month, year] = dateStr.split("-");
        return `${year}-${month}-${day}`;
      }
      // Se está no formato DD/MM/YYYY, converte para YYYY-MM-DD
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
        const [day, month, year] = dateStr.split("/");
        return `${year}-${month}-${day}`;
      }
      // Retorna como está se não reconhecer o formato
      return dateStr;
    };

    const formattedBirthDate = formatBirthDate(formData.birthDate);

    // Construir objeto ENEM baseado no tipo de ingresso
    const isEnem = formData.ingressType === "ENEM";

    // Construir payload
    const payload: MarketplaceInscriptionPayload = {
      inscricao: {
        enem: {
          utilizar: isEnem,
        },
        anoConclusao: parseInt(formData.schoolYear) || new Date().getFullYear(),
        aceiteTermo: formData.acceptTerms !== false,
        aceitaReceberEmail: formData.acceptEmail !== false,
        aceitaReceberSMS: formData.acceptSms !== false,
        aceitaReceberWhatsApp: formData.acceptWhatsapp !== false,
        ofertas: {
          primeiraOpcao: {
            idDMH: offerDetails.idDmhElastic,
          },
        },
        canalVendas: {
          id: 141, // ID fixo do canal de vendas Bolsa Click
        },
        idTipoProva: 2, // Vestibular online
      },
      dadosPessoais: {
        nome: formData.name,
        cpf: formattedCpf,
        sexo: genderMap[formData.gender] || "M",
        rg: formData.rg || "",
        dataNascimento: formattedBirthDate,
        email: formData.email,
        celular: cleanPhone,
        endereco: {
          logradouro: formData.address,
          numero: formData.addressNumber,
          bairro: formData.neighborhood,
          cep: formattedCep,
          uf: formData.state,
          municipio: formData.city,
        },
      },
    };

    console.log("📝 Enviando inscrição para marketplace ATHENAS:", {
      idDMH: offerDetails.idDmhElastic,
      curso: offerDetails.course,
      aluno: formData.name,
      payload,
    });

    const response = await tartarus.post(
      "cogna/courses/create-inscription-marketplace",
      payload,
    );

    console.log(
      "✅ Inscrição no marketplace ATHENAS criada com sucesso:",
      response.data,
    );
    return { success: true, data: response.data };
  } catch (error: unknown) {
    console.error("❌ Erro ao criar inscrição no marketplace:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Erro desconhecido";
    return { success: false, error: errorMessage };
  }
}
