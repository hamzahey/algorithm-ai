"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { Briefcase, ArrowLeft } from "lucide-react"
import { useEffect, useState } from "react"
import { fetchJob, updateJob } from "@/lib/api"

export default function EditJobPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [company, setCompany] = useState("")
  const [description, setDescription] = useState("")
  const [salary, setSalary] = useState("")
  const [tags, setTags] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const params = useParams()
  const jobId = params?.id

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setIsLoading(true)
      setError(null)
      if (!jobId) {
        if (!cancelled) {
          setError("Job identifier missing")
          setIsLoading(false)
        }
        return
      }

      try {
        const job = await fetchJob(jobId)
        if (cancelled) return
        setTitle(job.title)
        setCompany(job.company)
        setDescription(job.description)
        setSalary(job.salary)
        setTags(job.tags.join(", "))
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unable to load job")
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
  }, [jobId])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsSaving(true)
    setError(null)

    const parsedTags = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)

      if (!parsedTags.length) {
      setError("Add at least one tag")
      setIsSaving(false)
      return
    }

    if (!jobId) {
      setError("Job identifier missing")
      setIsSaving(false)
      return
    }

    try {
      await updateJob(jobId, {
        title,
        company,
        description,
        salary,
        tags: parsedTags,
      })
      router.replace("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save job")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <nav className="border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </Link>
          <Link href="/" className="flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold text-primary">JobHub</span>
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-card border border-border rounded-lg p-8">
          <h1 className="text-3xl font-bold text-foreground mb-8">Edit Job</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading job data…</p>
            ) : (
              <>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Job Title</label>
                    <Input
                      type="text"
                      placeholder="e.g., Senior React Developer"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Company Name</label>
                    <Input
                      type="text"
                      placeholder="e.g., TechCorp"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Job Description</label>
                  <textarea
                    placeholder="Describe the role, responsibilities, and requirements..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-32"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Salary Range</label>
                    <Input
                      type="text"
                      placeholder="e.g., $100,000 - $150,000"
                      value={salary}
                      onChange={(e) => setSalary(e.target.value)}
                      className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Tags (comma-separated)</label>
                    <Input
                      type="text"
                      placeholder="e.g., React, TypeScript, Node.js"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                  <Link href="/dashboard" className="flex-1">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-border hover:bg-muted bg-transparent"
                    >
                      Cancel
                    </Button>
                  </Link>
                </div>
                {error && (
                  <p className="text-sm text-destructive mt-3" role="alert">
                    {error}
                  </p>
                )}
              </>
            )}
          </form>
        </div>
      </div>
    </main>
  )
}

