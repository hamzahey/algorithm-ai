import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Briefcase, MapPin, DollarSign, ArrowLeft, Share2 } from "lucide-react"

// Mock job details
const MOCK_JOBS: Record<string, any> = {
  "1": {
    id: "1",
    title: "Senior React Developer",
    company: "TechCorp",
    description: "Looking for an experienced React developer to join our team.",
    fullDescription: `We're looking for a Senior React Developer to join our growing engineering team. You'll be working on cutting-edge projects using modern web technologies.

Key Responsibilities:
- Develop and maintain React components
- Collaborate with designers and other developers
- Optimize application performance
- Mentor junior developers
- Participate in code reviews

Required Skills:
- 5+ years of React experience
- Strong TypeScript knowledge
- Experience with testing frameworks
- Git proficiency`,
    salary: "$120,000 - $160,000",
    tags: ["React", "TypeScript", "JavaScript"],
    location: "San Francisco, CA",
    jobType: "Full-time",
    postedDate: "2 days ago",
  },
  "2": {
    id: "2",
    title: "Full Stack Engineer",
    company: "StartupXYZ",
    description: "Help us build the next big thing. Full stack role with modern tech.",
    fullDescription: `Join our innovative startup and help us build amazing products. We're looking for a Full Stack Engineer who can handle both frontend and backend development.

Responsibilities:
- Build scalable web applications
- Design and implement APIs
- Optimize database queries
- Deploy and monitor applications

Requirements:
- Experience with Node.js and React
- PostgreSQL knowledge
- Understanding of microservices
- Problem-solving mindset`,
    salary: "$100,000 - $140,000",
    tags: ["Node.js", "React", "PostgreSQL"],
    location: "Remote",
    jobType: "Full-time",
    postedDate: "5 days ago",
  },
}

export default function JobDetailPage({ params }: { params: { id: string } }) {
  const job = MOCK_JOBS[params.id] || MOCK_JOBS["1"]

  return (
    <main className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border sticky top-0 bg-background/80 backdrop-blur-sm z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link
            href="/jobs"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back to Jobs</span>
          </Link>
          <div className="flex gap-3">
            <Button variant="ghost" size="sm" className="gap-2">
              <Share2 className="w-4 h-4" />
              Share
            </Button>
            <Link href="/auth/signup">
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Apply Now
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">{job.title}</h1>
              <p className="text-lg text-primary font-semibold">{job.company}</p>
            </div>
          </div>

          {/* Meta Info */}
          <div className="flex flex-wrap gap-6 text-sm text-muted-foreground mb-6">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {job.location}
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              {job.salary}
            </div>
            <div>{job.jobType}</div>
            <div>Posted {job.postedDate}</div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Description */}
            <div className="bg-card border border-border rounded-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">About this role</h2>
              <div className="prose prose-invert max-w-none">
                {job.fullDescription.split("\n\n").map((paragraph: string, index: number) => (
                  <div key={index} className="mb-4">
                    {paragraph.split("\n").map((line: string, lineIndex: number) => {
                      if (line.endsWith(":")) {
                        return (
                          <h3 key={lineIndex} className="font-semibold text-foreground mt-4 mb-2">
                            {line}
                          </h3>
                        )
                      }
                      if (line.startsWith("- ")) {
                        return (
                          <li key={lineIndex} className="text-muted-foreground ml-4 mb-1">
                            {line.slice(2)}
                          </li>
                        )
                      }
                      return (
                        <p key={lineIndex} className="text-muted-foreground leading-relaxed">
                          {line}
                        </p>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply Card */}
            <div className="bg-card border border-border rounded-lg p-6 sticky top-24">
              <h3 className="text-lg font-bold text-foreground mb-4">Ready to apply?</h3>
              <Link href="/auth/signup">
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mb-3">
                  Apply Now
                </Button>
              </Link>
              <p className="text-xs text-muted-foreground text-center">Sign up to apply and track your applications</p>
            </div>

            {/* Tags */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-3">Required Skills</h4>
              <div className="flex flex-wrap gap-2">
                {job.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="inline-block bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Company Info */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">{job.company}</h4>
                  <p className="text-sm text-muted-foreground">Tech Company</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Innovative tech company building products that matter.
              </p>
              <Button variant="outline" className="w-full border-border hover:bg-muted bg-transparent">
                View Company
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
