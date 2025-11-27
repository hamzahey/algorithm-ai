"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Briefcase, Search, X } from "lucide-react"
import { browseJobs, type JobListing } from "@/lib/api"
import { CurrentUser, getCurrentUser } from "@/lib/session"

type ApiJob = JobListing

export default function JobsPage() {
  const [searchTitle, setSearchTitle] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [matchMode, setMatchMode] = useState<"and" | "or">("and")
  const [jobs, setJobs] = useState<ApiJob[]>([])
  const [tagOptions, setTagOptions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUser, setCurrentUserState] = useState<CurrentUser | null | undefined>(undefined)

  const activeFilterLabel =
    selectedTags.length > 0 ? `Tags (${matchMode.toUpperCase()})` : "Tags"

  const combinedTagOptions = useMemo(() => {
    const tags = new Set(selectedTags)
    jobs.forEach((job) => job.tags.forEach((tag) => tags.add(tag)))
    tagOptions.forEach((tag) => tags.add(tag))
    return Array.from(tags).sort((a, b) => a.localeCompare(b))
  }, [jobs, selectedTags, tagOptions])

  useEffect(() => {
    let cancelled = false
    const handler = setTimeout(async () => {
      setIsLoading(true)
      setError(null)

      try {
        const data = await browseJobs({
          search: searchTitle,
          tags: selectedTags,
          mode: matchMode,
        })

        if (cancelled) return

        setJobs(data)
        const newTags = Array.from(new Set(data.flatMap((job) => job.tags)))
        setTagOptions((prev) =>
          Array.from(new Set([...prev, ...newTags])).sort((a, b) => a.localeCompare(b)),
        )
      } catch (err) {
        if (cancelled) return
        setError(err instanceof Error ? err.message : "Unable to load jobs")
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }, 250)

    return () => {
      cancelled = true
      clearTimeout(handler)
    }
  }, [searchTitle, selectedTags, matchMode])

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    )
  }

  useEffect(() => {
    setCurrentUserState(getCurrentUser())
  }, [])

  const showAuthLinks = currentUser === null

  return (
    <main className="min-h-screen bg-background">
      <nav className="border-b border-border sticky top-0 bg-background/80 backdrop-blur-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <Briefcase className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold text-primary">JobHub</span>
          </Link>
          <div className="flex gap-3">
            {showAuthLinks && (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" className="text-foreground">
                    Log In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Sign Up</Button>
                </Link>
              </>
            )}
            {currentUser?.isAdmin && (
              <Link href="/admin/users">
                <Button variant="outline" className="border-border hover:bg-muted">
                  Admin
                </Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-2">Discover Opportunities</h1>
          <p className="text-muted-foreground">
            {isLoading ? "Loading jobs…" : `${jobs.length} positions ready for you`}
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          <div className="space-y-6">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                <div>
                  <h3 className="font-semibold text-foreground">{activeFilterLabel}</h3>
                  <div className="text-xs text-muted-foreground">{matchMode === "and" ? "All tags" : "Any tag"}</div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={matchMode === "and" ? "default" : "outline"}
                    className="text-xs uppercase tracking-wide"
                    onClick={() => setMatchMode("and")}
                  >
                    AND
                  </Button>
                  <Button
                    variant={matchMode === "or" ? "default" : "outline"}
                    className="text-xs uppercase tracking-wide"
                    onClick={() => setMatchMode("or")}
                  >
                    OR
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                {combinedTagOptions.length === 0 && !isLoading ? (
                  <p className="text-sm text-muted-foreground">No tags available yet.</p>
                ) : (
                  combinedTagOptions.map((tag) => (
                    <label
                      key={tag}
                      className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedTags.includes(tag)}
                        onChange={() => toggleTag(tag)}
                        className="rounded border-border"
                      />
                      <span className="text-sm text-foreground">{tag}</span>
                    </label>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-2">
              {selectedTags.length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setSelectedTags([])}
                  className="w-full border-border hover:bg-muted"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          <div className="lg:col-span-3 space-y-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search by title or company..."
                value={searchTitle}
                onChange={(event) => setSearchTitle(event.target.value)}
                className="pl-10 bg-card border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className="flex items-center gap-2 bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm hover:bg-accent/80 transition-colors"
                  >
                    {tag}
                    <X className="w-4 h-4" />
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{isLoading ? "Searching…" : `${jobs.length} positions`}</span>
              {error && <span className="text-destructive">{error}</span>}
            </div>

            <div className="space-y-4">
              {isLoading ? (
                <div className="bg-card border border-border rounded-lg p-12 text-center text-muted-foreground">
                  Loading jobs…
                </div>
              ) : jobs.length === 0 ? (
                <div className="bg-card border border-border rounded-lg p-12 text-center">
                  <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No jobs found</h3>
                  <p className="text-muted-foreground">Try different filters or keywords</p>
                </div>
              ) : (
                jobs.map((job) => (
                  <Link
                    key={job.id}
                    href={`/jobs/${job.id}`}
                    className="block bg-card border border-border rounded-lg p-6 hover:shadow-lg hover:border-primary transition-all group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                          {job.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">{job.company}</p>
                      </div>
                      <span className="text-primary font-semibold text-sm whitespace-nowrap">{job.salary}</span>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4">{job.description}</p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {job.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-block bg-muted text-muted-foreground px-2 py-1 rounded text-xs font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex justify-between items-center text-xs uppercase tracking-wide text-muted-foreground">
                      <span>{job.status}</span>
                      <span>
                        Posted {new Date(job.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

