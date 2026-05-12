'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function MaintenancePage() {
  const router = useRouter();
  const [dots, setDots] = useState('');

  // Animate dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(d => d.length >= 3 ? '' : d + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Poll every 15s — redirect back when maintenance ends
  useEffect(() => {
    const poll = setInterval(async () => {
      try {
        const res = await fetch(`${API}/api/admin/settings/maintenance`);
        const data = await res.json();
        if (!data.maintenanceMode) {
          const user = JSON.parse(localStorage.getItem('user') || 'null');
          const role = user?.role || 'developer';
          router.replace(`/dashboard/${role}`);
        }
      } catch {}
    }, 15000);
    return () => clearInterval(poll);
  }, [router]);

  return (
    <div className="min-h-screen bg-[#101010] flex flex-col items-center justify-center px-4 text-center">
      {/* Animated icon */}
      <div className="mb-8 relative">
        <div className="w-24 h-24 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center animate-pulse">
          <svg className="w-12 h-12 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
          </svg>
        </div>
      </div>

      <h1 className="text-3xl font-bold text-white mb-3">
        System Maintenance
      </h1>

      <p className="text-gray-400 text-lg mb-2">
        Please wait a moment{dots}
      </p>

      <p className="text-gray-500 text-sm max-w-md mb-8">
        The system is currently undergoing scheduled maintenance. We'll be back shortly. Thank you for your patience.
      </p>

      <div className="flex items-center gap-2 text-xs text-gray-600 bg-white/5 border border-white/10 rounded-full px-4 py-2">
        <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
        Checking status automatically every 15 seconds
      </div>
    </div>
  );
}
