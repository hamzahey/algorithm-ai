"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Briefcase } from "lucide-react"
import { type FormEvent, useState } from "react"
import { login } from "@/lib/api"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      await login({ email, password })
      router.replace("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="flex items-center gap-2 w-fit">
            <Briefcase className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold text-primary">JobHub</span>
          </Link>
        </div>
      </nav>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-lg p-8 space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-foreground">Welcome back</h1>
              <p className="text-muted-foreground">Sign in to your JobHub account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email</label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                  required
                />
              </div>

              <Link href="#" className="text-sm text-primary hover:text-primary/80 transition-colors inline-block">
                Forgot password?
              </Link>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
              {error && (
                <p className="text-sm text-destructive mt-2" role="alert">
                  {error}
                </p>
              )}
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-card text-muted-foreground">or</span>
              </div>
            </div>

            <Button variant="outline" className="w-full border-border hover:bg-muted bg-transparent">
              Continue with Google
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/auth/signup" className="text-primary hover:text-primary/80 transition-colors font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
