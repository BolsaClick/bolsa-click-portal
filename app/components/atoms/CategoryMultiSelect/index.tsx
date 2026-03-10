'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Plus, Loader2 } from 'lucide-react'

interface Category {
  id: string
  slug: string
  title: string
}

interface Props {
  categories: Category[]
  selectedIds: string[]
  onChange: (ids: string[]) => void
  onCategoryCreated: (category: Category) => void
  firebaseUser: { getIdToken: () => Promise<string> } | null
}

export default function CategoryMultiSelect({
  categories,
  selectedIds,
  onChange,
  onCategoryCreated,
  firebaseUser,
}: Props) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = categories.filter(
    (c) =>
      c.title.toLowerCase().includes(query.toLowerCase()) &&
      !selectedIds.includes(c.id)
  )

  const exactMatch = categories.some(
    (c) => c.title.toLowerCase() === query.trim().toLowerCase()
  )

  const selectedCategories = categories.filter((c) =>
    selectedIds.includes(c.id)
  )

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleRemove = (id: string) => {
    onChange(selectedIds.filter((sid) => sid !== id))
  }

  const handleSelect = (id: string) => {
    onChange([...selectedIds, id])
    setQuery('')
    inputRef.current?.focus()
  }

  const handleCreate = async () => {
    if (!firebaseUser || !query.trim()) return
    setCreating(true)
    try {
      const token = await firebaseUser.getIdToken()
      const res = await fetch('/api/admin/blog/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: query.trim() }),
      })
      if (res.ok) {
        const { category } = await res.json()
        onCategoryCreated(category)
        onChange([...selectedIds, category.id])
        setQuery('')
        inputRef.current?.focus()
      }
    } catch {
      // silent
    } finally {
      setCreating(false)
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Categorias *
      </label>

      {/* Selected pills */}
      <div
        className="flex flex-wrap gap-1.5 min-h-[42px] px-3 py-2 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-bolsa-primary focus-within:border-transparent cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {selectedCategories.map((cat) => (
          <span
            key={cat.id}
            className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-sm px-2.5 py-0.5 rounded-full"
          >
            {cat.title}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handleRemove(cat.id)
              }}
              className="hover:bg-blue-200 rounded-full p-0.5 transition"
            >
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={selectedIds.length === 0 ? 'Buscar ou criar categoria...' : ''}
          className="flex-1 min-w-[120px] outline-none text-sm bg-transparent"
        />
      </div>

      {/* Dropdown */}
      {isOpen && (query || filtered.length > 0) && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {filtered.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleSelect(cat.id)}
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition"
            >
              {cat.title}
            </button>
          ))}

          {query.trim() && !exactMatch && (
            <button
              type="button"
              onClick={handleCreate}
              disabled={creating}
              className="w-full text-left px-3 py-2 text-sm text-bolsa-primary hover:bg-pink-50 transition flex items-center gap-2 border-t"
            >
              {creating ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Plus size={14} />
              )}
              Criar &ldquo;{query.trim()}&rdquo;
            </button>
          )}

          {filtered.length === 0 && (exactMatch || !query.trim()) && (
            <div className="px-3 py-2 text-sm text-gray-400">
              Nenhuma categoria encontrada
            </div>
          )}
        </div>
      )}
    </div>
  )
}
