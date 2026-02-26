import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, ScanSearch, Lock, Server } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen text-white font-sans">

      {/* ================= HEADER ================= */}
      <header className="w-full border-b border-zinc-800 bg-zinc-950/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold tracking-wide">
            Cyber<span className="text-orange-500">Secure</span>
          </h1>

          <nav className="hidden md:flex gap-8 text-sm text-zinc-300">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <Link href="/about" className="hover:text-white transition">About</Link>
            <Link href="/services" className="hover:text-white transition">Services</Link>
            <Link href="/contact" className="hover:text-white transition">Contact</Link>
          </nav>

          <Link
            href="/scan"
            className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 transition text-sm font-semibold"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* ================= HERO SECTION ================= */}
      <section className="relative min-h-[90vh] flex items-center justify-center text-center px-6 overflow-hidden bg-black">
        <Image
          src="/image.png"
          alt="Cyber Security Background"
          fill
          priority
          className="object-cover"
        />

        {/* Light Overlay */}
        <div className="absolute inset-0 bg-black/30"></div>

        <div className="relative z-10 max-w-4xl">
          <h2 className="text-4xl md:text-6xl font-bold">
             Website Penetration Testing Platform
          </h2>

          <p className="mt-6 text-lg text-zinc-200">
            Identify vulnerabilities before attackers do.
            Protect your infrastructure with real-time scanning.
          </p>

          <div className="mt-10 flex justify-center gap-4">
            <Link
              href="/scan"
              className="px-8 py-3 rounded-lg bg-orange-500 hover:bg-orange-600 transition font-semibold"
            >
              Start Security Scan
            </Link>

            <Link
              href="/about"
              className="px-8 py-3 rounded-lg border border-white/30 hover:bg-white/10 transition"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* ================= FEATURES SECTION ================= */}
      <section className="py-24 px-6 bg-zinc-900">
        <div className="max-w-6xl mx-auto text-center mb-16">
          <h3 className="text-3xl font-bold">
            Our Security Services
          </h3>
          <p className="text-zinc-400 mt-4">
            Comprehensive solutions designed for modern web security.
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8">

          <div className="bg-zinc-800 p-8 rounded-2xl border border-zinc-700 hover:border-orange-500 transition shadow-lg">
            <ShieldCheck className="text-orange-500 mb-4" size={36} />
            <h4 className="text-xl font-semibold mb-3">Security Assessment</h4>
            <p className="text-zinc-400 text-sm">
              Full vulnerability and risk analysis.
            </p>
          </div>

          <div className="bg-zinc-800 p-8 rounded-2xl border border-zinc-700 hover:border-yellow-400 transition shadow-lg">
            <ScanSearch className="text-yellow-400 mb-4" size={36} />
            <h4 className="text-xl font-semibold mb-3">Automated Scanning</h4>
            <p className="text-zinc-400 text-sm">
              Detect SQL Injection and XSS attacks.
            </p>
          </div>

          <div className="bg-zinc-800 p-8 rounded-2xl border border-zinc-700 hover:border-orange-500 transition shadow-lg">
            <Lock className="text-orange-500 mb-4" size={36} />
            <h4 className="text-xl font-semibold mb-3">Data Protection</h4>
            <p className="text-zinc-400 text-sm">
              Secure sensitive data and user credentials.
            </p>
          </div>

          <div className="bg-zinc-800 p-8 rounded-2xl border border-zinc-700 hover:border-yellow-400 transition shadow-lg">
            <Server className="text-yellow-400 mb-4" size={36} />
            <h4 className="text-xl font-semibold mb-3">Server Analysis</h4>
            <p className="text-zinc-400 text-sm">
              Identify server weaknesses and outdated software.
            </p>
          </div>

        </div>
      </section>

      {/* ================= TRUST SECTION (DIFFERENT COLOR) ================= */}
      <section className="py-24 px-6 bg-slate-800">
        <div className="max-w-5xl mx-auto text-center">
          <h3 className="text-3xl font-bold mb-6">
            Why Choose CyberSecure?
          </h3>
          <p className="text-slate-300 text-lg">
            We combine automated scanning with expert-level analysis 
            to provide reliable and accurate security reports.
            Our system is designed for startups, enterprises,
            and security professionals.
          </p>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-zinc-950 border-t border-zinc-800 py-10">
        <div className="max-w-6xl mx-auto px-6 text-center text-zinc-500 text-sm">
          <p>© 2026 CyberSecure. All rights reserved.</p>
          <p className="mt-2">
            Professional Web Application Security Testing Platform
          </p>
        </div>
      </footer>

    </div>
  );
}