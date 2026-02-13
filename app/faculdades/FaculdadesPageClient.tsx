'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, MapPin, Star, GraduationCap, Building2 } from 'lucide-react'
import Container from '@/app/components/atoms/Container'
import Breadcrumb from '@/app/components/atoms/Breadcrumb'
import type { InstitutionListItem } from './_data/types'

type Props = {
  institutions: InstitutionListItem[]
}

const modalityLabels: Record<string, string> = {
  EAD: 'EAD',
  PRESENCIAL: 'Presencial',
  SEMIPRESENCIAL: 'Semipresencial',
}

export default function FaculdadesPageClient({ institutions }: Props) {
  const [search, setSearch] = useState('')

  const filtered = institutions.filter((inst) =>
    inst.name.toLowerCase().includes(search.toLowerCase()) ||
    inst.fullName.toLowerCase().includes(search.toLowerCase()) ||
    (inst.headquartersCity && inst.headquartersCity.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <section className="bg-gray-50 min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-r from-bolsa-primary to-pink-600 text-white py-12 md:py-16">
        <Container>
          <Breadcrumb
            items={[
              { label: 'Início', href: '/' },
              { label: 'Faculdades Parceiras' },
            ]}
          />
          <h1 className="text-3xl md:text-4xl font-bold mt-4">
            Faculdades Parceiras com Bolsa de Estudo
          </h1>
          <p className="text-white/90 mt-3 text-lg max-w-2xl">
            Conheça as instituições de ensino parceiras do Bolsa Click. Encontre bolsas de estudo
            com até 95% de desconto em universidades reconhecidas pelo MEC.
          </p>

          {/* Search */}
          <div className="mt-6 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
              <input
                type="text"
                placeholder="Buscar faculdade por nome ou cidade..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
          </div>
        </Container>
      </div>

      {/* Grid */}
      <Container>
        <div className="py-10">
          {filtered.length === 0 ? (
            <p className="text-center text-neutral-500 py-12">
              Nenhuma faculdade encontrada para &quot;{search}&quot;.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((inst) => (
                <Link
                  key={inst.id}
                  href={`/faculdades/${inst.slug}`}
                  className="bg-white rounded-xl shadow-sm border border-neutral-200 hover:shadow-md hover:border-bolsa-primary/30 transition-all duration-200 overflow-hidden group"
                >
                  {/* Card Header */}
                  <div className="p-6 flex items-center gap-4 border-b border-neutral-100">
                    <div className="w-16 h-16 rounded-lg bg-neutral-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                      <Image
                        src={inst.logoUrl}
                        alt={`Logo ${inst.name}`}
                        width={56}
                        height={56}
                        className="object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                          target.parentElement!.innerHTML = `<span class="text-2xl font-bold text-neutral-400">${inst.shortName.charAt(0)}</span>`
                        }}
                      />
                    </div>
                    <div className="min-w-0">
                      <h2 className="font-bold text-lg text-neutral-800 group-hover:text-bolsa-primary transition-colors truncate">
                        {inst.name}
                      </h2>
                      <p className="text-sm text-neutral-500 truncate">{inst.fullName}</p>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 space-y-3">
                    <p className="text-sm text-neutral-600 line-clamp-2">{inst.description}</p>

                    {/* Stats */}
                    <div className="flex flex-wrap gap-3 pt-2">
                      {inst.mecRating && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-yellow-50 text-yellow-700">
                          <Star size={12} fill="currentColor" />
                          MEC {inst.mecRating}
                        </span>
                      )}
                      {inst.headquartersCity && inst.headquartersState && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
                          <MapPin size={12} />
                          {inst.headquartersCity}/{inst.headquartersState}
                        </span>
                      )}
                      {inst.campusCount && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-green-50 text-green-700">
                          <Building2 size={12} />
                          {inst.campusCount}+ polos
                        </span>
                      )}
                    </div>

                    {/* Modalities */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {inst.modalities.map((mod) => (
                        <span
                          key={mod}
                          className="text-xs px-2 py-0.5 rounded bg-neutral-100 text-neutral-600"
                        >
                          {modalityLabels[mod] || mod}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="px-6 pb-6">
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-bolsa-primary group-hover:underline">
                      <GraduationCap size={16} />
                      Ver bolsas disponíveis
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </Container>
    </section>
  )
}
