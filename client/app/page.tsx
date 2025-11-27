"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Briefcase, Search, Users, Zap } from "lucide-react";
import { CurrentUser, getCurrentUser } from "@/lib/session";

export default function Home() {
  const [currentUser, setCurrentUserState] = useState<CurrentUser | null | undefined>(undefined);

  useEffect(() => {
    setCurrentUserState(getCurrentUser());
  }, []);

  const showAuthLinks = currentUser === null;
  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Navigation */}
      <nav className="border-b border-border sticky top-0 bg-background/80 backdrop-blur-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <Briefcase className="w-6 h-6 text-primary group-hover:text-accent transition-colors" />
            <span className="text-xl font-bold text-primary">JobHub</span>
          </Link>
          <div className="flex gap-3">
            {showAuthLinks && (
              <>
                <Link href="/auth/login">
                  <Button
                    variant="ghost"
                    className="text-foreground hover:text-primary"
                  >
                    Log In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold text-balance leading-tight text-foreground">
                Find Your <span className="text-primary">Next Opportunity</span>
              </h1>
              <p className="text-lg text-muted-foreground mt-4 leading-relaxed">
                Discover amazing jobs from innovative companies. Search by role,
                skills, and more to find positions that match your career goals.
              </p>
            </div>
            <div className="flex gap-4 flex-wrap">
              <Link href="/jobs">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Browse Jobs
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-border hover:bg-muted bg-transparent"
                >
                  Post a Job
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-xl p-6 space-y-2 hover:shadow-lg transition-shadow">
              <Search className="w-8 h-8 text-accent" />
              <h3 className="font-semibold text-card-foreground">
                Smart Search
              </h3>
              <p className="text-sm text-muted-foreground">
                Filter by title, company, and skills
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl p-6 space-y-2 hover:shadow-lg transition-shadow">
              <Zap className="w-8 h-8 text-accent" />
              <h3 className="font-semibold text-card-foreground">
                Quick Apply
              </h3>
              <p className="text-sm text-muted-foreground">
                Apply in seconds with your profile
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl p-6 space-y-2 hover:shadow-lg transition-shadow">
              <Briefcase className="w-8 h-8 text-accent" />
              <h3 className="font-semibold text-card-foreground">
                Job Listings
              </h3>
              <p className="text-sm text-muted-foreground">
                Thousands of positions available
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl p-6 space-y-2 hover:shadow-lg transition-shadow">
              <Users className="w-8 h-8 text-accent" />
              <h3 className="font-semibold text-card-foreground">
                For Employers
              </h3>
              <p className="text-sm text-muted-foreground">
                Hire top talent easily
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-t border-border bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl font-bold text-primary">12K+</p>
              <p className="text-muted-foreground mt-2">Active Jobs</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">5K+</p>
              <p className="text-muted-foreground mt-2">Companies</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">50K+</p>
              <p className="text-muted-foreground mt-2">Job Seekers</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">98%</p>
              <p className="text-muted-foreground mt-2">Satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <p className="text-muted-foreground text-sm">
              © 2025 JobHub. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                Terms
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
