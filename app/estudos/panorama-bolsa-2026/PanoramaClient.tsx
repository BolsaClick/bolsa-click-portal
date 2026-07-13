import Link from 'next/link'
import type { PanoramaData } from '@/app/lib/seo/study-data'

interface Props {
  data: PanoramaData
  datePublished: string
  dateModified: string
}

const TYPE_LABEL: Record<string, string> = {
  BACHARELADO: 'Bacharelado',
  LICENCIATURA: 'Licenciatura',
  TECNOLOGO: 'Tecnólogo',
  ESPECIALIZACAO: 'Especialização',
  MBA: 'MBA',
}

const DEMAND_LABEL: Record<string, string> = {
  ALTA: 'Alta',
  MEDIA: 'Média',
  BAIXA: 'Baixa',
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export default function PanoramaClient({ data, datePublished, dateModified }: Props) {
  return (
    <main className="bg-paper">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="bg-white border-b border-hairline">
        <div className="container mx-auto px-4 py-3">
          <ol className="flex items-center gap-2 font-mono text-[11px] tracking-[0.16em] uppercase text-ink-500 flex-wrap">
            <li><Link href="/" className="hover:text-ink-900">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href="/estudos" className="hover:text-ink-900">Estudos</Link></li>
            <li aria-hidden="true">/</li>
            <li className="text-ink-900">Panorama Bolsa 2026</li>
          </ol>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-white border-b border-hairline">
        <div className="container mx-auto px-4 py-12 md:py-16 max-w-4xl">
          <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-ink-500 mb-4">
            Estudo Bolsa Click · Publicado em {formatDate(datePublished)}
          </p>
          <h1 className="font-display text-4xl md:text-5xl text-ink-900 leading-[1.05] tracking-tight">
            Panorama da Bolsa de Estudo no Brasil 2026
          </h1>
          <p className="mt-6 text-lg md:text-xl text-ink-700 leading-relaxed">
            Dados originais sobre o mercado de bolsas de estudo no Brasil em 2026: cobertura por
            modalidade, distribuição geográfica de polos, salários por área de atuação e instituições
            parceiras. Catálogo Bolsa Click cruzado com fontes oficiais.
          </p>
          <p className="mt-4 text-sm text-ink-500">
            Última atualização: {formatDate(dateModified)} · Licença: <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer" className="underline">CC BY 4.0</a> (livre pra citar com atribuição)
          </p>
        </div>
      </section>

      {/* TL;DR — KPIs principais */}
      <section className="bg-paper border-b border-hairline py-10 md:py-14">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="font-mono text-[11px] tracking-[0.22em] uppercase text-ink-700 hairline-b pb-3 mb-6">
            Números do estudo
          </h2>
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-px bg-hairline border border-hairline">
            <div className="bg-white px-5 py-5">
              <dt className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-500">Cursos cobertos</dt>
              <dd className="mt-1 font-display num-tabular text-3xl text-ink-900">{data.totalCursosAtivos}</dd>
            </div>
            <div className="bg-white px-5 py-5">
              <dt className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-500">Cidades cobertas</dt>
              <dd className="mt-1 font-display num-tabular text-3xl text-ink-900">{data.totalCidadesCobertas}</dd>
            </div>
            <div className="bg-white px-5 py-5">
              <dt className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-500">Estados</dt>
              <dd className="mt-1 font-display num-tabular text-3xl text-ink-900">{data.estadosCobertos}/27</dd>
            </div>
            <div className="bg-white px-5 py-5">
              <dt className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-500">Instituições parceiras</dt>
              <dd className="mt-1 font-display num-tabular text-3xl text-ink-900">{data.totalInstituicoes}</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Cobertura por nível */}
      <section className="bg-white border-b border-hairline py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="font-display text-2xl md:text-3xl text-ink-900 mb-3">Cobertura por nível de ensino</h2>
          <p className="text-ink-700 leading-relaxed mb-6">
            O catálogo Bolsa Click em 2026 cobre {data.totalCursosAtivos} cursos ativos, distribuídos
            entre graduação ({data.totalGraduacao} cursos, {Math.round((data.totalGraduacao / data.totalCursosAtivos) * 100)}% do total) e pós-graduação ({data.totalPosGraduacao} cursos, {Math.round((data.totalPosGraduacao / data.totalCursosAtivos) * 100)}%). A cobertura de graduação inclui
            bacharelado, licenciatura e tecnólogo nas três modalidades reconhecidas pelo MEC: presencial,
            EAD e semipresencial.
          </p>

          <table className="w-full text-sm border-collapse border border-hairline">
            <caption className="sr-only">Distribuição de cursos por tipo de graduação</caption>
            <thead className="bg-paper">
              <tr className="border-b border-hairline">
                <th scope="col" className="text-left py-3 px-4 font-mono text-[10px] tracking-[0.18em] uppercase text-ink-500">Tipo</th>
                <th scope="col" className="text-right py-3 px-4 font-mono text-[10px] tracking-[0.18em] uppercase text-ink-500">Quantidade</th>
                <th scope="col" className="text-right py-3 px-4 font-mono text-[10px] tracking-[0.18em] uppercase text-ink-500">% do total</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(data.porTipo)
                .sort((a, b) => b[1] - a[1])
                .map(([type, count]) => (
                  <tr key={type} className="border-b border-hairline/60">
                    <td className="py-3 px-4 text-ink-900">{TYPE_LABEL[type] ?? type}</td>
                    <td className="py-3 px-4 text-right num-tabular text-ink-900">{count}</td>
                    <td className="py-3 px-4 text-right num-tabular text-ink-700">
                      {Math.round((count / data.totalCursosAtivos) * 100)}%
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Demanda */}
      <section className="bg-paper border-b border-hairline py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="font-display text-2xl md:text-3xl text-ink-900 mb-3">Demanda de mercado por curso</h2>
          <p className="text-ink-700 leading-relaxed mb-6">
            Cada curso enriquecido recebe classificação de demanda de mercado baseada em sinais
            cruzados: volume de contratações no CAGED, vagas abertas nos principais portais de
            emprego e crescimento setorial. A distribuição em 2026 mostra concentração em carreiras
            de alta demanda (tech, saúde, engenharias).
          </p>

          <table className="w-full text-sm border-collapse border border-hairline">
            <thead className="bg-white">
              <tr className="border-b border-hairline">
                <th scope="col" className="text-left py-3 px-4 font-mono text-[10px] tracking-[0.18em] uppercase text-ink-500">Demanda</th>
                <th scope="col" className="text-right py-3 px-4 font-mono text-[10px] tracking-[0.18em] uppercase text-ink-500">Cursos</th>
                <th scope="col" className="text-right py-3 px-4 font-mono text-[10px] tracking-[0.18em] uppercase text-ink-500">% do total</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(data.porDemanda)
                .sort((a, b) => b[1] - a[1])
                .map(([demand, count]) => (
                  <tr key={demand} className="bg-white border-b border-hairline/60">
                    <td className="py-3 px-4 text-ink-900">{DEMAND_LABEL[demand] ?? demand}</td>
                    <td className="py-3 px-4 text-right num-tabular text-ink-900">{count}</td>
                    <td className="py-3 px-4 text-right num-tabular text-ink-700">
                      {Math.round((count / data.totalCursosAtivos) * 100)}%
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Top 10 cursos com salários */}
      <section className="bg-white border-b border-hairline py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="font-display text-2xl md:text-3xl text-ink-900 mb-3">Top 10 cursos com salários médios</h2>
          <p className="text-ink-700 leading-relaxed mb-6">
            Faixa salarial média no Brasil, segundo dados do CAGED (Cadastro Geral de Empregados e
            Desempregados do Ministério do Trabalho) cruzados com pesquisa setorial. Os valores
            variam por região, experiência e setor — capitais como São Paulo, Rio de Janeiro e
            Distrito Federal pagam em média 25-35% acima da média nacional.
          </p>

          <table className="w-full text-sm border-collapse border border-hairline">
            <thead className="bg-paper">
              <tr className="border-b border-hairline">
                <th scope="col" className="text-left py-3 px-4 font-mono text-[10px] tracking-[0.18em] uppercase text-ink-500">Curso</th>
                <th scope="col" className="text-left py-3 px-4 font-mono text-[10px] tracking-[0.18em] uppercase text-ink-500">Salário médio</th>
              </tr>
            </thead>
            <tbody>
              {data.topCursos.map((c) => (
                <tr key={c.slug} className="border-b border-hairline/60">
                  <td className="py-3 px-4 text-ink-900">
                    <Link href={`/carreiras/${c.slug}`} className="hover:text-bolsa-secondary underline">{c.name}</Link>
                  </td>
                  <td className="py-3 px-4 text-ink-700 num-tabular">{c.averageSalary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Áreas de atuação */}
      {data.cursosPorArea.length > 0 && (
        <section className="bg-paper border-b border-hairline py-12 md:py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="font-display text-2xl md:text-3xl text-ink-900 mb-3">Áreas de atuação mais frequentes</h2>
            <p className="text-ink-700 leading-relaxed mb-6">
              Distribuição das áreas de atuação mais comuns entre os cursos cobertos. Indica
              concentração de mercado e setores absorvedores no Brasil em 2026.
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-px bg-hairline border border-hairline">
              {data.cursosPorArea.slice(0, 12).map((a) => (
                <li key={a.area} className="bg-white px-4 py-3 flex items-baseline justify-between">
                  <span className="text-ink-900">{a.area}</span>
                  <span className="font-mono num-tabular text-sm text-ink-700">{a.count} cursos</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Distribuição geográfica */}
      <section className="bg-white border-b border-hairline py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="font-display text-2xl md:text-3xl text-ink-900 mb-3">Distribuição geográfica</h2>
          <p className="text-ink-700 leading-relaxed mb-6">
            Cobertura territorial do Bolsa Click em 2026: {data.totalCidadesCobertas} cidades em{' '}
            {data.estadosCobertos} estados brasileiros (cobertura nacional completa). A lista de
            cidades é gerada combinando os 27 capitais + grandes municípios IBGE 2022 + cidades com
            polo físico confirmado das instituições parceiras (Anhanguera, Unopar, Pitágoras,
            Unime).
          </p>

          <table className="w-full text-sm border-collapse border border-hairline">
            <thead className="bg-paper">
              <tr className="border-b border-hairline">
                <th scope="col" className="text-left py-3 px-4 font-mono text-[10px] tracking-[0.18em] uppercase text-ink-500">Estado (UF)</th>
                <th scope="col" className="text-right py-3 px-4 font-mono text-[10px] tracking-[0.18em] uppercase text-ink-500">Cidades cobertas</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(data.cidadesPorEstado)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 12)
                .map(([uf, count]) => (
                  <tr key={uf} className="border-b border-hairline/60">
                    <td className="py-3 px-4 text-ink-900 font-mono">{uf}</td>
                    <td className="py-3 px-4 text-right num-tabular text-ink-700">{count}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Metodologia */}
      <section className="bg-paper py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="font-display text-2xl md:text-3xl text-ink-900 mb-4">Metodologia e fontes</h2>
          <p className="text-ink-700 leading-relaxed mb-4">
            O estudo combina três fontes de dados: <strong>(1) Catálogo Bolsa Click</strong> ({data.totalCursosAtivos} cursos enriquecidos com descrição editorial, salário médio, áreas de atuação, demanda de mercado e duração padrão); <strong>(2) CAGED 2024-2025</strong> do Ministério do Trabalho pra faixas salariais reais por profissão; <strong>(3) IBGE Censo 2022</strong> pra geografia (cidades e estados).
          </p>
          <p className="text-ink-700 leading-relaxed mb-4">
            Os dados são agregados via queries diretas ao banco de produção do Bolsa Click,
            atualizados a cada 24 horas. Salários médios são extraídos da pesquisa editorial feita
            pra cada curso enriquecido — passam por revisão da equipe editorial antes de publicação.
          </p>
          <p className="text-ink-700 leading-relaxed mb-6">
            <strong>Limitações</strong>: a cobertura editorial não inclui todos os cursos da API
            Tartarus (catálogo dos parceiros Cogna) — apenas os com conteúdo editorial validado
            atingem o status &ldquo;ativo&rdquo;. Outros cursos podem estar disponíveis na plataforma
            via API mas sem página dedicada com FAQ + schema completo. A distribuição geográfica
            reflete cidades com cobertura editorial garantida (presença real de polo confirmada ou
            relevância populacional).
          </p>

          <h3 className="font-display text-xl text-ink-900 mb-3">Fontes citáveis</h3>
          <ul className="space-y-2 text-ink-700">
            {data.fontesDados.map((f) => (
              <li key={f} className="flex items-baseline gap-2">
                <span className="text-ink-500">•</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 hairline-t pt-6">
            <h3 className="font-display text-xl text-ink-900 mb-3">Citação acadêmica/jornalística</h3>
            <p className="font-mono text-xs text-ink-700 bg-white border border-hairline p-4 leading-relaxed">
              Bolsa Click. (2026). <em>Panorama da Bolsa de Estudo no Brasil 2026</em>. Disponível em:
              https://www.bolsaclick.com.br/estudos/panorama-bolsa-2026. Acesso em [data].
            </p>
            <p className="mt-3 text-sm text-ink-500">
              Licença: <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer" className="underline">CC BY 4.0</a> — livre uso com atribuição.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
