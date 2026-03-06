"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { ShieldCheck } from "lucide-react"
import Link from "next/link"

const privacySections = [
  {
    title: "Information Collection",
    content:
      "We collect data to improve your experience, including usage patterns and preferences. This includes information you provide directly, such as account details, and data collected automatically through cookies and analytics tools.",
  },
  {
    title: "Use of Data",
    content:
      "Your data helps us provide better services and personalized recommendations. We use this information to enhance security testing accuracy, improve our AI algorithms, and deliver customized vulnerability reports.",
  },
  {
    title: "Third-Party Sharing",
    content:
      "We do not sell your information. We may share anonymized data with partners for analytics and security research purposes only. Your sensitive security data remains confidential and encrypted.",
  },
  {
    title: "Cookies & Tracking",
    content:
      "Cookies are used to enhance site functionality and analyze trends. We use both session and persistent cookies to maintain your login state and understand how you interact with our platform.",
  },
  {
    title: "Security Measures",
    content:
      "We protect your data using industry-standard encryption and secure storage. All vulnerability data is encrypted at rest and in transit using AES-256 and TLS 1.3 protocols.",
  },
  {
    title: "User Rights",
    content:
      "You can request access, correction, or deletion of your personal data anytime. Contact our privacy team to exercise your rights under GDPR, CCPA, and other applicable data protection regulations.",
  },
  {
    title: "Policy Updates",
    content:
      "Changes to this policy will be communicated on the website. Continued use implies consent. We will notify you of significant changes via email and provide a 30-day notice period.",
  },
]

export default function PrivacyPolicyModal() {
  const [scrollProgress, setScrollProgress] = useState(0)
  const contentRef = useRef(null)

  const handleScroll = () => {
    const content = contentRef.current
    if (!content) return
    const progress = Math.min(1, content.scrollTop / (content.scrollHeight - content.clientHeight))
    setScrollProgress(progress)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-3xl bg-primary flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">
              Cyber<span className="text-orange-500">Secure</span>
            </span>
          </Link>
          <Link href="/">
            <Button variant="outline" className="rounded-3xl">
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-4xl mx-auto px-4 py-12 md:px-6 md:py-16">
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-1.5 text-xs font-medium text-orange-500">
              Legal Document
            </div>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              Privacy Policy
            </h1>
            <p className="text-lg text-muted-foreground">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          {/* Scroll Progress Bar */}
          <div className="sticky top-16 z-40 h-1 w-full bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-500 transition-all duration-200"
              style={{ width: `${scrollProgress * 100}%` }}
            />
          </div>

          {/* Content */}
          <div
            ref={contentRef}
            onScroll={handleScroll}
            className="space-y-8 overflow-y-auto"
            style={{ maxHeight: "calc(100vh - 300px)" }}
          >
            {privacySections.map((section, idx) => (
              <div
                key={idx}
                className="rounded-3xl border bg-card p-6 transition-all hover:border-orange-500/30 hover:shadow-lg"
              >
                <h2 className="mb-3 text-xl font-semibold flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/10 text-sm font-bold text-orange-500">
                    {idx + 1}
                  </span>
                  {section.title}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {section.content}
                </p>
              </div>
            ))}
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col gap-4 rounded-3xl border bg-muted/50 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-semibold">Questions about our privacy policy?</h3>
              <p className="text-sm text-muted-foreground">
                Contact our privacy team for more information.
              </p>
            </div>
            <Button className="rounded-3xl">
              Contact Us
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
