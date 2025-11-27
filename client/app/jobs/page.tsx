"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Briefcase, MapPin, Search, X } from "lucide-react"

// Mock job data
const MOCK_JOBS = [
  {
    id: "1",
    title: "Senior React Developer",
    company: "TechCorp",
    description: "Looking for an experienced React developer to join our team.",
    salary: "$120,000 - $160,000",
    tags: ["React", "TypeScript", "JavaScript"],
    location: "San Francisco, CA",
  },
  {
    id: "2",
    title: "Full Stack Engineer",
    company: "StartupXYZ",
    description: "Help us build the next big thing. Full stack role with modern tech.",
    salary: "$100,000 - $140,000",
    tags: ["Node.js", "React", "PostgreSQL"],
    location: "Remote",
  },
  {
    id: "3",
    title: "Product Designer",
    company: "DesignStudio",
    description: "Create beautiful and intuitive user interfaces.",
    salary: "$90,000 - $130,000",
    tags: ["UI/UX", "Figma", "Design Systems"],
    location: "New York, NY",
  },
  {
    id: "4",
    title: "DevOps Engineer",
    company: "CloudServices",
    description: "Manage and optimize our cloud infrastructure.",
    salary: "$110,000 - $150,000",
    tags: ["Kubernetes", "AWS", "Docker"],
    location: "Austin, TX",
  },
  {
    id: "5",
    title: "Data Scientist",
    company: "DataCorp",
    description: "Analyze complex datasets and build ML models.",
    salary: "$130,000 - $170,000",
    tags: ["Python", "Machine Learning", "Data Analysis"],
    location: "Boston, MA",
  },
  {
    id: "6",
    title: "Junior Developer",
    company: "TechCorp",
    description: "Start your development career with us.",
    salary: "$60,000 - $90,000",
    tags: ["JavaScript", "React", "CSS"],
    location: "Remote",
  },
]

export default function JobsPage() {
  const [searchTitle, setSearchTitle] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const allTags = Array.from(new Set(MOCK_JOBS.flatMap((job) => job.tags)))

  const filteredJobs = useMemo(() => {
    return MOCK_JOBS.filter((job) => {
      const titleMatch =
        job.title.toLowerCase().includes(searchTitle.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTitle.toLowerCase())

      if (selectedTags.length === 0) return titleMatch

      const tagsMatch = selectedTags.some((tag) => job.tags.includes(tag))
      return titleMatch && tagsMatch
    })
  }, [searchTitle, selectedTags])

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border sticky top-0 bg-background/80 backdrop-blur-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <Briefcase className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold text-primary">JobHub</span>
          </Link>
          <div className="flex gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" className="text-foreground">
                Log In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Sign Up</Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-2">Discover Opportunities</h1>
          <p className="text-muted-foreground">Browse {MOCK_JOBS.length} available positions</p>
        </div>

        {/* Search and Filters */}
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-foreground mb-3">Search by Tag</h3>
              <div className="space-y-2">
                {allTags.map((tag) => (
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
                ))}
              </div>
            </div>

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

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search by title or company..."
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
                className="pl-10 bg-card border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {/* Active Filters */}
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

            {/* Job Listings */}
            <div className="space-y-4">
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job) => (
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

                    <div className="flex items-center text-muted-foreground text-sm">
                      <MapPin className="w-4 h-4 mr-2" />
                      {job.location}
                    </div>
                  </Link>
                ))
              ) : (
                <div className="bg-card border border-border rounded-lg p-12 text-center">
                  <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No jobs found</h3>
                  <p className="text-muted-foreground">Try adjusting your search filters</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
