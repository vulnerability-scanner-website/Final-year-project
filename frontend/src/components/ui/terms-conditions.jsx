'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function TocDialog() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const contentRef = useRef(null);

  const handleScroll = () => {
    const content = contentRef.current;
    if (!content) return;
    const progress = Math.min(1, content.scrollTop / (content.scrollHeight - content.clientHeight));
    setScrollProgress(progress);
  };

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
              Terms & Conditions
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
            <div className="rounded-3xl border bg-card p-6 transition-all hover:border-orange-500/30 hover:shadow-lg">
              <h2 className="mb-3 text-xl font-semibold flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/10 text-sm font-bold text-orange-500">1</span>
                Acceptance of Terms
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing and using this website, users agree to comply with and be bound by these Terms of Service. Users who do not agree with these terms should discontinue use of the website immediately.
              </p>
            </div>

            <div className="rounded-3xl border bg-card p-6 transition-all hover:border-orange-500/30 hover:shadow-lg">
              <h2 className="mb-3 text-xl font-semibold flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/10 text-sm font-bold text-orange-500">2</span>
                User Account Responsibilities
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Users are responsible for maintaining the confidentiality of their account credentials. Any activities occurring under a user's account are the sole responsibility of the account holder. Users must notify the website administrators immediately of any unauthorized account access.
              </p>
            </div>

            <div className="rounded-3xl border bg-card p-6 transition-all hover:border-orange-500/30 hover:shadow-lg">
              <h2 className="mb-3 text-xl font-semibold flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/10 text-sm font-bold text-orange-500">3</span>
                Content Usage and Restrictions
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                The website and its original content are protected by intellectual property laws. Users may not reproduce, distribute, modify, create derivative works, or commercially exploit any content without explicit written permission from the website owners.
              </p>
            </div>

            <div className="rounded-3xl border bg-card p-6 transition-all hover:border-orange-500/30 hover:shadow-lg">
              <h2 className="mb-3 text-xl font-semibold flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/10 text-sm font-bold text-orange-500">4</span>
                Limitation of Liability
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                The website provides content "as is" without any warranties. The website owners shall not be liable for direct, indirect, incidental, consequential, or punitive damages arising from user interactions with the platform.
              </p>
            </div>

            <div className="rounded-3xl border bg-card p-6 transition-all hover:border-orange-500/30 hover:shadow-lg">
              <h2 className="mb-3 text-xl font-semibold flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/10 text-sm font-bold text-orange-500">5</span>
                User Conduct Guidelines
              </h2>
              <ul className="text-muted-foreground leading-relaxed list-disc pl-6 space-y-2">
                <li>Not upload harmful or malicious content</li>
                <li>Respect the rights of other users</li>
                <li>Avoid activities that could disrupt website functionality</li>
                <li>Comply with applicable local and international laws</li>
              </ul>
            </div>

            <div className="rounded-3xl border bg-card p-6 transition-all hover:border-orange-500/30 hover:shadow-lg">
              <h2 className="mb-3 text-xl font-semibold flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/10 text-sm font-bold text-orange-500">6</span>
                Modifications to Terms
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                The website reserves the right to modify these terms at any time. Continued use of the website after changes constitutes acceptance of the new terms.
              </p>
            </div>

            <div className="rounded-3xl border bg-card p-6 transition-all hover:border-orange-500/30 hover:shadow-lg">
              <h2 className="mb-3 text-xl font-semibold flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/10 text-sm font-bold text-orange-500">7</span>
                Termination Clause
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                The website may terminate or suspend user access without prior notice for violations of these terms or for any other reason deemed appropriate by the administration.
              </p>
            </div>

            <div className="rounded-3xl border bg-card p-6 transition-all hover:border-orange-500/30 hover:shadow-lg">
              <h2 className="mb-3 text-xl font-semibold flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/10 text-sm font-bold text-orange-500">8</span>
                Governing Law
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                These terms are governed by the laws of the jurisdiction where the website is primarily operated, without regard to conflict of law principles.
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col gap-4 rounded-3xl border bg-muted/50 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-semibold">Questions about our terms?</h3>
              <p className="text-sm text-muted-foreground">
                Contact our legal team for more information.
              </p>
            </div>
            <Button className="rounded-3xl">
              Contact Us
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
