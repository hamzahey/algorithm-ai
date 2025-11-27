type ApiError = {
  message?: string
  error?: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

const defaultHeaders = {
  "Content-Type": "application/json",
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    ...init,
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
}) {
  return request("/auth/register", {
    method: "POST",
    headers: defaultHeaders,
    body: JSON.stringify(payload),
  })
}

export async function login(payload: { email: string; password: string }) {
  return request("/auth/login", {
    method: "POST",
    headers: defaultHeaders,
    body: JSON.stringify(payload),
  })
}

export async function signOut() {
  return request("/auth/signout", {
    method: "POST",
  })
}

export { API_BASE_URL }

