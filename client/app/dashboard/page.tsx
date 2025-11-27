"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Briefcase, Plus, Edit2, Trash2, LogOut } from "lucide-react"
import { useState } from "react"

// Mock user jobs
const MOCK_USER_JOBS = [
  {
    id: "1",
    title: "Senior React Developer",
    company: "TechCorp",
    salary: "$120,000 - $160,000",
    tags: ["React", "TypeScript"],
    applicants: 24,
    views: 156,
    status: "active",
  },
  {
    id: "2",
    title: "UI Designer",
    company: "TechCorp",
    salary: "$80,000 - $120,000",
    tags: ["UI/UX", "Figma"],
    applicants: 12,
    views: 89,
    status: "active",
  },
]

export default function DashboardPage() {
  const [jobs, setJobs] = useState(MOCK_USER_JOBS)

  const handleDelete = (id: string) => {
    setJobs(jobs.filter((job) => job.id !== id))
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
            <Link href="/jobs">
              <Button variant="ghost" className="text-foreground">
                Browse Jobs
              </Button>
            </Link>
            <Button variant="outline" className="border-border hover:bg-muted gap-2 bg-transparent">
              <LogOut className="w-4 h-4" />
              Logout
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
            <p className="text-4xl font-bold text-primary">{jobs.length}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-muted-foreground text-sm font-medium mb-2">Total Applicants</p>
            <p className="text-4xl font-bold text-accent">{jobs.reduce((sum, job) => sum + job.applicants, 0)}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-muted-foreground text-sm font-medium mb-2">Total Views</p>
            <p className="text-4xl font-bold text-primary">{jobs.reduce((sum, job) => sum + job.views, 0)}</p>
          </div>
        </div>

        {/* Job Listings */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Your Postings</h2>
          {jobs.length > 0 ? (
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

                <div className="flex gap-2 mb-4 flex-wrap">
                  {job.tags.map((tag) => (
                    <span key={tag} className="bg-muted text-muted-foreground px-2 py-1 rounded text-xs font-medium">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex justify-between items-center mb-4">
                  <div className="flex gap-6 text-sm">
                    <div>
                      <p className="text-muted-foreground">Applicants</p>
                      <p className="text-lg font-semibold text-foreground">{job.applicants}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Views</p>
                      <p className="text-lg font-semibold text-foreground">{job.views}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="border-border hover:bg-muted gap-2 bg-transparent">
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
              </div>
            ))
          ) : (
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
          )}
        </div>
      </div>
    </main>
  )
}
