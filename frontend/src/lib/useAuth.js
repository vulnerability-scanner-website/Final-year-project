'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export function useAuth(requiredRole = null) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    if (!token || !user) {
      router.replace('/auth/login');
      return;
    }

    if (requiredRole && user.role !== requiredRole) {
      router.replace(`/dashboard/${user.role}`);
      return;
    }

    // Admins bypass maintenance mode
    if (user.role === 'admin') return;

    // Check maintenance mode for non-admins
    fetch(`${API}/api/admin/settings/maintenance`)
      .then(r => r.json())
      .then(data => {
        if (data.maintenanceMode) {
          router.replace('/maintenance');
        }
      })
      .catch(() => {}); // silently fail — don't block on network error
  }, [router, requiredRole]);
}
