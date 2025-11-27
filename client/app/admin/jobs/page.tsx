"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Briefcase } from "lucide-react"
import { useEffect, useState } from "react"
import { approveAdminJob, deleteAdminJob, fetchAdminJobs } from "@/lib/api"
import { clearCurrentUser, getCurrentUser, CurrentUser } from "@/lib/session"

type AdminJob = {
  id: string
  title: string
  company: string
  description: string
  salary: string | null
  tags: string[]
  status: string
  approved: boolean
  createdAt: string
  user: {
    id: string
    name: string
    email: string
  }
}

export default function AdminJobsPage() {
  const router = useRouter()
  const [jobs, setJobs] = useState<AdminJob[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUser, setCurrentUserState] = useState<CurrentUser | null>(null)
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    setCurrentUserState(getCurrentUser())
  }, [])

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const data = await fetchAdminJobs()
        if (!cancelled) {
          setJobs(data)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unable to load jobs")
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
  }, [processing])

  const handleApprove = async (jobId: string, approved: boolean) => {
    setProcessing(jobId)
    try {
      await approveAdminJob(jobId, approved)
      setJobs((prev) =>
        prev.map((job) => (job.id === jobId ? { ...job, approved } : job)),
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update job")
    } finally {
      setProcessing(null)
    }
  }

  const handleDelete = async (jobId: string) => {
    setProcessing(jobId)
    try {
      await deleteAdminJob(jobId)
      setJobs((prev) => prev.filter((job) => job.id !== jobId))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete job")
    } finally {
      setProcessing(null)
    }
  }

  const handleSignOut = async () => {
    clearCurrentUser()
    router.replace("/auth/login")
  }

  return (
    <main className="min-h-screen bg-background">
      <nav className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold text-primary">JobHub</span>
          </Link>
          <div className="flex gap-3">
            <Button variant="outline" className="border-border hover:bg-muted" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col gap-2 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Moderate Job Posts</h1>
              <p className="text-muted-foreground text-sm">
                {currentUser ? `Logged in as ${currentUser.name}` : "Admin panel"}
              </p>
            </div>
            <Link href="/admin/users">
              <Button variant="outline" className="border-border hover:bg-muted">
                View Users
              </Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">
            Approve or delete posts that violate policies.
          </p>
        </div>

        {isLoading ? (
          <div className="bg-card border border-border rounded-lg p-8 text-center text-muted-foreground">
            Loading jobs…
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
                  <th className="px-4 py-3">Job</th>
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3">Posted By</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id} className="border-t border-border">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-foreground">{job.title}</div>
                      <p className="text-muted-foreground text-xs">{job.description}</p>
                    </td>
                    <td className="px-4 py-3">{job.company}</td>
                    <td className="px-4 py-3">
                      {job.user.name}
                      <br />
                      <span className="text-xs text-muted-foreground">{job.user.email}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full uppercase tracking-wide text-[10px] ${
                          job.approved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {job.approved ? "Approved" : "Pending"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="xs"
                          variant={job.approved ? "outline" : "default"}
                          disabled={processing === job.id}
                          className="min-w-[96px]"
                          onClick={() => handleApprove(job.id, !job.approved)}
                        >
                          {job.approved ? "Unapprove" : "Approve"}
                        </Button>
                        <Button
                          size="xs"
                          variant="destructive"
                          disabled={processing === job.id}
                          className="min-w-[96px]"
                          onClick={() => handleDelete(job.id)}
                        >
                          Delete
                        </Button>
                      </div>
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

