import Link from "next/link";
import { ShieldCheck, ScanSearch, Lock, Server } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white font-sans">
      
      {/* HERO SECTION */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-32">
        <h1 className="text-4xl md:text-6xl font-bold leading-tight max-w-4xl">
          Advanced Website Penetration Testing & Vulnerability Scanning
        </h1>
        <p className="mt-6 text-lg text-zinc-400 max-w-2xl">
          Protect your web applications from cyber threats. 
          Identify vulnerabilities before attackers do.
        </p>

        <div className="mt-8 flex gap-4">
          <Link
            href="/scan"
            className="px-6 py-3 rounded-lg bg-green-500 hover:bg-green-600 transition font-semibold"
          >
            Start Free Scan
          </Link>

          <Link
            href="/about"
            className="px-6 py-3 rounded-lg border border-zinc-600 hover:bg-zinc-800 transition"
          >
            Learn More
          </Link>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-20 px-6 bg-zinc-900">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-10 text-center">

          <div className="flex flex-col items-center">
            <ShieldCheck size={40} className="text-green-500 mb-4" />
            <h3 className="text-xl font-semibold">Security Assessment</h3>
            <p className="text-zinc-400 mt-2">
              Comprehensive analysis of web vulnerabilities.
            </p>
          </div>

          <div className="flex flex-col items-center">
            <ScanSearch size={40} className="text-green-500 mb-4" />
            <h3 className="text-xl font-semibold">Automated Scanning</h3>
            <p className="text-zinc-400 mt-2">
              Detect SQL Injection, XSS, and other attacks.
            </p>
          </div>

          <div className="flex flex-col items-center">
            <Lock size={40} className="text-green-500 mb-4" />
            <h3 className="text-xl font-semibold">Data Protection</h3>
            <p className="text-zinc-400 mt-2">
              Secure sensitive information from breaches.
            </p>
          </div>

          <div className="flex flex-col items-center">
            <Server size={40} className="text-green-500 mb-4" />
            <h3 className="text-xl font-semibold">Server Analysis</h3>
            <p className="text-zinc-400 mt-2">
              Identify misconfigurations and weaknesses.
            </p>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="text-center py-6 bg-black border-t border-zinc-800 text-zinc-500">
        © 2026 CyberScan. All rights reserved.
      </footer>

    </div>
  );
}