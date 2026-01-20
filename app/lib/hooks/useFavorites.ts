'use client'

import { useState, useEffect } from 'react'
import { Course } from '@/app/interface/course'

const FAVORITES_KEY = 'bolsa-click-favorites'

// Função auxiliar para extrair unitId de diferentes formatos possíveis
const extractUnitId = (course: Course | { unit?: { id?: string | number } }): string => {
  // Primeiro, tentar usar unitId diretamente (apenas se for Course)
  if ('unitId' in course && course.unitId != null && course.unitId !== '') {
    return String(course.unitId).trim()
  }
  
  // Tentar extrair de um objeto unit aninhado (formato da API most-searched)
  if (course.unit && typeof course.unit === 'object') {
    if (course.unit.id != null && course.unit.id !== '') {
      return String(course.unit.id).trim()
    }
  }
  
  // Se não tiver unitId, retornar string vazia
  // (a API pode não retornar unitId em alguns casos)
  return ''
}

// Função auxiliar para gerar uma chave única baseada em id + unitId
const getCourseKey = (course: Course): string => {
  // Normalizar id para string (garantir que sempre tenha um valor)
  const id = course.id != null && course.id !== '' ? String(course.id).trim() : ''
  
  if (!id) {
    // Se não tiver id, retornar uma chave vazia (não deveria acontecer, mas previne erros)
    return ''
  }
  
  // Extrair e normalizar unitId
  const unitId = extractUnitId(course)
  
  // Retornar chave única: id-unitId (sempre incluir o hífen para manter consistência)
  // Mesmo que unitId seja vazio, usar o formato id- para garantir comparação correta
  return `${id}-${unitId}`
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<Course[]>([])

  // Carregar favoritos do localStorage ao montar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(FAVORITES_KEY)
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          setFavorites(Array.isArray(parsed) ? parsed : [])
        } catch (error) {
          console.error('Erro ao carregar favoritos:', error)
          setFavorites([])
        }
      }
    }
  }, [])

  // Salvar favoritos no localStorage sempre que mudar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
    }
  }, [favorites])

  const addFavorite = (course: Course) => {
    setFavorites(prev => {
      // Verificar se já existe (comparar por id + unitId)
      const courseKey = getCourseKey(course)
      const exists = prev.some(fav => {
        const favKey = getCourseKey(fav)
        return favKey === courseKey
      })
      
      if (exists) {
        return prev
      }
      
      return [...prev, course]
    })
  }

  const removeFavorite = (course: Course) => {
    setFavorites(prev => {
      const courseKey = getCourseKey(course)
      return prev.filter(fav => {
        const favKey = getCourseKey(fav)
        return favKey !== courseKey
      })
    })
  }

  const toggleFavorite = (course: Course) => {
    const courseKey = getCourseKey(course)
    const isFavorite = favorites.some(fav => {
      const favKey = getCourseKey(fav)
      return favKey === courseKey
    })

    if (isFavorite) {
      removeFavorite(course)
    } else {
      addFavorite(course)
    }
  }

  const isFavorite = (course: Course): boolean => {
    const courseKey = getCourseKey(course)
    
    // Primeiro, tentar encontrar por chave completa (id + unitId)
    const foundByFullKey = favorites.some(fav => {
      const favKey = getCourseKey(fav)
      return favKey === courseKey
    })
    
    if (foundByFullKey) {
      return true
    }
    
    // Se não encontrou por chave completa e o curso atual não tem unitId,
    // tentar encontrar apenas por id (caso o favorito tenha unitId mas o curso atual não)
    const courseUnitId = extractUnitId(course)
    if (!courseUnitId) {
      const courseId = course.id != null && course.id !== '' ? String(course.id).trim() : ''
      if (courseId) {
        return favorites.some(fav => {
          const favId = fav.id != null && fav.id !== '' ? String(fav.id).trim() : ''
          return favId === courseId
        })
      }
    }
    
    return false
  }

  const clearFavorites = () => {
    setFavorites([])
  }

  return {
    favorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    clearFavorites,
  }
}

