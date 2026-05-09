export const LAST_SEARCH_KEY = 'bc_last_search'
export const VISITED_COURSES_KEY = 'bc_visited_courses'
export const VISITED_MAX = 12
export const PERSONALIZATION_CHANGE_EVENT = 'bc:personalization-change'

export type LastSearch = {
  course?: string
  city?: string
  state?: string
  modality?: string
  level?: string
  ts: number
}

export type VisitedCourse = {
  slug: string
  name: string
  ts: number
}

const isBrowser = () => typeof window !== 'undefined'

const dispatchChange = () => {
  if (!isBrowser()) return
  try {
    window.dispatchEvent(new CustomEvent(PERSONALIZATION_CHANGE_EVENT))
  } catch {
    // ignore
  }
}

export function readLastSearch(): LastSearch | null {
  if (!isBrowser()) return null
  try {
    const raw = window.localStorage.getItem(LAST_SEARCH_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as LastSearch
    if (typeof parsed?.ts !== 'number') return null
    return parsed
  } catch {
    return null
  }
}

export function writeLastSearch(s: Omit<LastSearch, 'ts'>): void {
  if (!isBrowser()) return
  try {
    const next: LastSearch = { ...s, ts: Date.now() }
    window.localStorage.setItem(LAST_SEARCH_KEY, JSON.stringify(next))
    dispatchChange()
  } catch {
    // ignore
  }
}

export function clearLastSearch(): void {
  if (!isBrowser()) return
  try {
    window.localStorage.removeItem(LAST_SEARCH_KEY)
    dispatchChange()
  } catch {
    // ignore
  }
}

export function readVisitedCourses(): VisitedCourse[] {
  if (!isBrowser()) return []
  try {
    const raw = window.localStorage.getItem(VISITED_COURSES_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as VisitedCourse[]
    if (!Array.isArray(parsed)) return []
    return parsed.filter((c) => c && typeof c.slug === 'string' && typeof c.name === 'string')
  } catch {
    return []
  }
}

export function pushVisitedCourse(course: Omit<VisitedCourse, 'ts'>): void {
  if (!isBrowser()) return
  try {
    const current = readVisitedCourses()
    const dedup = current.filter((c) => c.slug !== course.slug)
    const next: VisitedCourse[] = [{ ...course, ts: Date.now() }, ...dedup].slice(0, VISITED_MAX)
    window.localStorage.setItem(VISITED_COURSES_KEY, JSON.stringify(next))
    dispatchChange()
  } catch {
    // ignore
  }
}

export function clearVisitedCourses(): void {
  if (!isBrowser()) return
  try {
    window.localStorage.removeItem(VISITED_COURSES_KEY)
    dispatchChange()
  } catch {
    // ignore
  }
}

export function clearAllPersonalization(): void {
  clearLastSearch()
  clearVisitedCourses()
}
