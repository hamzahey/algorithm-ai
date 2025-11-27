export type CurrentUser = {
  id: string
  email: string
  name: string
  isAdmin: boolean
  lastLoginAt?: string
  createdAt?: string
  updatedAt?: string
}

const STORAGE_KEY = "jobhub_current_user"

export function getCurrentUser(): CurrentUser | null {
  if (typeof window === "undefined") return null
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as CurrentUser
  } catch {
    return null
  }
}

export function setCurrentUser(user: CurrentUser) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
}

export function clearCurrentUser() {
  if (typeof window === "undefined") return
  window.localStorage.removeItem(STORAGE_KEY)
}

