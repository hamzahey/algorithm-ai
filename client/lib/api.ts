import type { CurrentUser } from "./session"
import { getAuthToken, setAuthToken, clearAuthToken } from "./session"

type ApiError = {
  message?: string
  error?: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

// Headers are now handled in the request function

type AuthResponse = {
  user: CurrentUser
  accessToken: string
}

export type JobListing = {
  id: string
  title: string
  company: string
  description: string
  salary: string
  tags: string[]
  status: "ACTIVE" | "PAUSED" | "CLOSED" | "ARCHIVED"
  createdAt: string
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  // Get token from localStorage
  const token = getAuthToken()
  
  // Build headers with Authorization if token exists
  const headers = new Headers(init.headers)
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include", // Keep for CORS
    ...init,
    headers,
  })

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as ApiError | null
    const message =
      errorBody?.message ?? errorBody?.error ?? response.statusText ?? "Request failed"
    throw new Error(message)
  }

  return (await response.json()) as T
}

export async function register(payload: {
  email: string
  name: string
  password: string
}): Promise<AuthResponse> {
  const response = await request<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  })
  
  // Store token in localStorage
  if (response.accessToken) {
    setAuthToken(response.accessToken)
  }
  
  return response
}

export async function login(payload: { email: string; password: string }): Promise<AuthResponse> {
  const response = await request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  })
  
  // Store token in localStorage
  if (response.accessToken) {
    setAuthToken(response.accessToken)
  }
  
  return response
}

export async function signOut() {
  try {
    await request("/auth/signout", {
      method: "POST",
    })
  } finally {
    // Always clear token even if request fails
    clearAuthToken()
  }
}

export async function createJob(payload: {
  title: string
  company: string
  description: string
  salary: string
  tags: string[]
}) {
  return request("/jobs", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function fetchJobs() {
  return request("/jobs")
}

export async function deleteJob(id: string) {
  return request(`/jobs/${id}`, {
    method: "DELETE",
  })
}

export async function fetchJob(id: string) {
  return request(`/jobs/${id}`)
}

export async function updateJob(id: string, payload: {
  title: string
  company: string
  description: string
  salary: string
  tags: string[]
}) {
  return request(`/jobs/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  })
}

type BrowseJobsFilters = {
  search?: string
  tags?: string[]
  mode?: 'and' | 'or'
}

function buildQuery(filters?: BrowseJobsFilters) {
  if (!filters) return ''

  const params = new URLSearchParams()
  if (filters.search) params.set('search', filters.search)
  if (filters.mode) params.set('mode', filters.mode)
  if (filters.tags && filters.tags.length) params.set('tags', filters.tags.join(','))
  const query = params.toString()
  return query ? `?${query}` : ''
}

export async function browseJobs(filters?: BrowseJobsFilters) {
  return request<JobListing[]>(`/jobs/search${buildQuery(filters)}`)
}

export async function fetchAdminUsers() {
  return request("/admin/users")
}

export async function fetchAdminJobs(approved?: boolean) {
  const params = new URLSearchParams()
  if (approved !== undefined) {
    params.set("approved", String(approved))
  }
  const query = params.toString()
  return request(`/admin/jobs${query ? `?${query}` : ""}`)
}

export async function approveAdminJob(id: string, approved: boolean) {
  return request(`/admin/jobs/${id}/approve`, {
    method: "PATCH",
    body: JSON.stringify({ approved }),
  })
}

export async function deleteAdminJob(id: string) {
  return request(`/admin/jobs/${id}`, {
    method: "DELETE",
  })
}

export { API_BASE_URL }

