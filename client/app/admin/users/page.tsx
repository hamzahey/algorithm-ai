"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Briefcase } from "lucide-react"
import { fetchAdminUsers } from "@/lib/api"

type AdminUser = {
  id: string
  email: string
  name: string
  isAdmin: boolean
  lastLoginAt: string | null
  createdAt: string
  updatedAt: string
  jobCount: number
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await fetchAdminUsers()
        if (!cancelled) {
          setUsers(data)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unable to load users")
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <main className="min-h-screen bg-background">
      <nav className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold text-primary">JobHub</span>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" className="border-border hover:bg-muted">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Console</h1>
            <p className="text-muted-foreground text-sm">Overview of registered users</p>
          </div>
          <Link href="/admin/jobs">
            <Button variant="outline" className="border-border hover:bg-muted">
              Moderate Jobs
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="bg-card border border-border rounded-lg p-8 text-center text-muted-foreground">
            Loading users…
          </div>
        ) : error ? (
          <div className="bg-card border border-border rounded-lg p-8 text-center text-destructive">
            {error}
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted text-muted-foreground uppercase text-xs tracking-wide">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Jobs</th>
                  <th className="px-4 py-3">Last Login</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t border-border">
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">{user.name}</span>
                        {user.isAdmin && (
                          <span className="text-[10px] uppercase tracking-wide text-primary">Admin</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-foreground">{user.jobCount}</span>
                    </td>
                    <td className="px-4 py-3">
                      {user.lastLoginAt
                        ? new Date(user.lastLoginAt).toLocaleString()
                        : "Never logged in"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  )
}

