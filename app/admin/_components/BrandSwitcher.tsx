'use client'

import { Loader2, ChevronDown, AlertTriangle } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { BRAND_IDS, BRANDS } from '@/app/lib/admin/brands'
import { useBrand } from './BrandProvider'

/**
 * Seletor de marca — SEMPRE visível no header do admin (toda tela dentro de
 * `/admin/*`). O pior modo de falha deste painel é um admin editar a marca
 * errada sem perceber, então o botão nunca aparece "neutro": ele carrega a
 * cor e o nome da marca ativa mesmo fechado.
 */
export function BrandSwitcher() {
  const { brand, config, statuses, switching, switchBrand } = useBrand()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={switching}
        className="flex items-center gap-2 pl-2.5 pr-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition disabled:opacity-60"
        title="Marca administrada nesta tela"
      >
        <span
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: config.color }}
          aria-hidden
        />
        <span className="text-sm font-semibold text-gray-900">{config.label}</span>
        {switching ? (
          <Loader2 size={14} className="animate-spin text-gray-400" />
        ) : (
          <ChevronDown size={14} className="text-gray-400" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-40 py-1">
          <p className="px-3 pt-1.5 pb-1 text-[11px] font-medium uppercase tracking-wide text-gray-400">
            Administrando
          </p>
          {BRAND_IDS.map((id) => {
            const cfg = BRANDS[id]
            const status = statuses[id]
            const isActive = id === brand
            const disabled = !status.available
            return (
              <button
                key={id}
                type="button"
                disabled={disabled}
                title={disabled ? status.reason : undefined}
                onClick={() => {
                  switchBrand(id)
                  setOpen(false)
                }}
                className={`w-full flex items-start gap-2.5 px-3 py-2 text-left transition ${
                  disabled
                    ? 'opacity-50 cursor-not-allowed'
                    : isActive
                      ? 'bg-gray-50'
                      : 'hover:bg-gray-50'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1"
                  style={{ backgroundColor: cfg.color }}
                  aria-hidden
                />
                <span className="flex-1 min-w-0">
                  <span className="flex items-center gap-1.5">
                    <span className={`text-sm ${isActive ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                      {cfg.label}
                    </span>
                    {isActive && (
                      <span className="text-[10px] bg-gray-900 text-white px-1.5 py-0.5 rounded-full">
                        ativa
                      </span>
                    )}
                  </span>
                  <span className="block text-[11px] text-gray-400">
                    {cfg.kind === 'local' ? 'Local (este servidor)' : 'Remota via API'}
                  </span>
                  {disabled && (
                    <span className="flex items-start gap-1 text-[11px] text-amber-600 mt-1">
                      <AlertTriangle size={12} className="flex-shrink-0 mt-[1px]" />
                      {status.reason}
                    </span>
                  )}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
