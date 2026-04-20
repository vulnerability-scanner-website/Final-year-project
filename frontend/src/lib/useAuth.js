'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
    }
  }, [router, requiredRole]);
}
