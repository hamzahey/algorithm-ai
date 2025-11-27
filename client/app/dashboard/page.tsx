"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Briefcase, Plus, Edit2, Trash2, LogOut } from "lucide-react"
import { useEffect, useState } from "react"
import { deleteJob, fetchJobs, signOut } from "@/lib/api"

type ApiJob = {
  id: string
  title: string
  company: string
  description: string
  salary: string
  tags: string[]
  status: "ACTIVE" | "PAUSED" | "CLOSED" | "ARCHIVED"
}

export default function DashboardPage() {
  const [jobs, setJobs] = useState<ApiJob[]>([])
  const [isSigningOut, setIsSigningOut] = useState(false)
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const activeCount = jobs.filter((job) => job.status === "ACTIVE").length
  const statusMessage = isLoading
    ? "Loading jobs..."
    : error
    ? "Unable to refresh"
    : "Up to date"

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const data = await fetchJobs()
        if (!cancelled) {
          setJobs(data)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load jobs")
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [])

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await signOut()
      router.replace("/auth/login")
    } catch {
      setIsSigningOut(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this job?")) {
      return
    }

    try {
      await deleteJob(id)
      setJobs((current) => current.filter((job) => job.id !== id))
    } catch {
      setError("Unable to delete job")
    }
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border sticky top-0 bg-background/80 backdrop-blur-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold text-primary">JobHub</span>
          </Link>
          <div className="flex gap-3">
            <Link href="/dashboard/post-job">
              <Button variant="ghost" className="text-foreground">
                Browse Jobs
              </Button>
            </Link>
              <Button
                variant="outline"
                className="border-border hover:bg-muted gap-2 bg-transparent"
                onClick={handleSignOut}
                disabled={isSigningOut}
              >
                <LogOut className="w-4 h-4" />
                {isSigningOut ? "Signing out..." : "Logout"}
              </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex justify-between items-start mb-12">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Manage your job postings</p>
          </div>
          <Link href="/dashboard/post-job">
            <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="w-4 h-4" />
              Post New Job
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-muted-foreground text-sm font-medium mb-2">Active Listings</p>
            <p className="text-4xl font-bold text-primary">{activeCount}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-muted-foreground text-sm font-medium mb-2">Total Listings</p>
            <p className="text-4xl font-bold text-accent">{jobs.length}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-muted-foreground text-sm font-medium mb-2">Status</p>
            <p className="text-4xl font-bold text-primary">{statusMessage}</p>
          </div>
        </div>

        {/* Job Listings */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Your Postings</h2>
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          {isLoading ? (
            <div className="bg-card border border-border rounded-lg p-6 text-center text-muted-foreground">
              Loading your jobs…
            </div>
          ) : jobs.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-12 text-center">
              <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No job postings yet</h3>
              <p className="text-muted-foreground mb-4">Start by creating your first job posting</p>
              <Link href="/dashboard/post-job">
                <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Plus className="w-4 h-4" />
                  Post a Job
                </Button>
              </Link>
            </div>
          ) : (
            jobs.map((job) => (
              <div key={job.id} className="bg-card border border-border rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{job.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {job.company} • {job.salary}
                    </p>
                  </div>
                  <span className="inline-block bg-green-500/20 text-green-600 px-3 py-1 rounded-full text-xs font-medium">
                    {job.status}
                  </span>
                </div>

                <p className="text-sm text-muted-foreground mb-4">{job.description}</p>

                <div className="flex gap-2 mb-4 flex-wrap">
                  {job.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-muted text-muted-foreground px-2 py-1 rounded text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-border hover:bg-muted gap-2 bg-transparent"
                      onClick={() => router.push(`/dashboard/post-job/${job.id}`)}
                    >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-destructive text-destructive hover:bg-destructive/10 gap-2 bg-transparent"
                    onClick={() => handleDelete(job.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  )
}
