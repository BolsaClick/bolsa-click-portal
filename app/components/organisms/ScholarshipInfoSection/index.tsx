import Link from 'next/link'
import Container from '../../atoms/Container'
import { GraduationCap, Laptop, Building, BadgePercent } from 'lucide-react'

export default function ScholarshipInfoSection() {
  return (
    <section className="bg-gray-50 py-16">
      <Container>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-blue-950 mb-6 text-center">
            Bolsas de Estudo: Tudo o que Você Precisa Saber
          </h2>
          <p className="text-neutral-600 text-center mb-10 text-lg leading-relaxed">
            Conseguir uma bolsa de estudo em faculdade nunca foi tão fácil.
            No Bolsa Click, você encontra descontos de até 95% em milhares de cursos.
            Veja como funciona.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {/* Bolsas EAD */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Laptop size={22} className="text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-blue-950">Bolsas EAD</h3>
              </div>
              <p className="text-neutral-600 leading-relaxed mb-3">
                As bolsas EAD permitem que você estude de casa, no seu ritmo.
                Ideal para quem trabalha ou mora longe de uma faculdade.
                Os cursos a distância possuem o mesmo diploma do presencial.
              </p>
              <p className="text-neutral-600 leading-relaxed">
                No Bolsa Click, as bolsas EAD chegam a até 80% de desconto.
                Você acessa aulas online, faz provas e recebe seu diploma reconhecido pelo MEC.
                Tudo sem sair de casa.
              </p>
            </div>

            {/* Bolsas Presenciais */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <Building size={22} className="text-emerald-600" />
                </div>
                <h3 className="text-lg font-bold text-blue-950">Bolsas em Faculdade Presencial</h3>
              </div>
              <p className="text-neutral-600 leading-relaxed mb-3">
                Prefere estudar em sala de aula? As bolsas presenciais oferecem
                descontos de até 70% em faculdades perto de você.
                Perfeito para quem busca contato direto com professores e colegas.
              </p>
              <p className="text-neutral-600 leading-relaxed">
                Compare preços entre faculdades da sua cidade.
                Encontre bolsas de estudo em faculdades particulares de todo o Brasil.
                Sua inscrição pelo Bolsa Click é sempre gratuita.
              </p>
            </div>

            {/* Bolsas Graduação */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                  <GraduationCap size={22} className="text-purple-600" />
                </div>
                <h3 className="text-lg font-bold text-blue-950">Bolsas de Graduação</h3>
              </div>
              <p className="text-neutral-600 leading-relaxed mb-3">
                Bacharelado, licenciatura ou tecnólogo: temos bolsas para todos os tipos de graduação.
                São mais de 100.000 cursos disponíveis em mais de 30.000 faculdades parceiras.
              </p>
              <p className="text-neutral-600 leading-relaxed">
                Cursos como Administração, Direito, Enfermagem e Pedagogia
                estão entre os mais procurados. Garanta sua vaga com desconto e comece a estudar.
              </p>
            </div>

            {/* Bolsas Pós-Graduação */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                  <BadgePercent size={22} className="text-orange-600" />
                </div>
                <h3 className="text-lg font-bold text-blue-950">Bolsas de Pós-Graduação</h3>
              </div>
              <p className="text-neutral-600 leading-relaxed mb-3">
                Especializações, MBAs e pós-graduação lato sensu com bolsas exclusivas.
                Avance na carreira pagando menos. Descontos de até 80% nas mensalidades.
              </p>
              <p className="text-neutral-600 leading-relaxed">
                As bolsas de pós-graduação são ideais para quem já se formou
                e quer se especializar. Cursos de 6 a 18 meses, online ou presencial.
              </p>
            </div>
          </div>

          {/* Resumo com CTA */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6 md:p-8 text-center">
            <h3 className="text-xl font-bold text-blue-950 mb-3">
              Como Conseguir uma Bolsa de Estudo em Faculdade?
            </h3>
            <p className="text-neutral-600 leading-relaxed mb-2">
              O processo é simples e rápido. Basta buscar o curso desejado, comparar as bolsas disponíveis
              e se inscrever gratuitamente. Não precisa de nota do ENEM.
            </p>
            <p className="text-neutral-600 leading-relaxed mb-6">
              As bolsas de estudo valem para todo o curso, não apenas para o primeiro semestre.
              Você paga a mensalidade com desconto do início ao fim da graduação.
            </p>
            <Link
              href="/curso/resultado?nivel=GRADUACAO"
              className="inline-flex items-center px-6 py-3 bg-bolsa-primary text-white font-medium rounded-lg hover:bg-bolsa-primary/90 transition-colors"
            >
              Buscar bolsas de estudo agora
            </Link>
          </div>
        </div>
      </Container>
    </section>
  )
}
