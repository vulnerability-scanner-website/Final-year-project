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

    if (requiredRole) {
      // Handle array of allowed roles
      const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
      
      if (!allowedRoles.includes(user.role)) {
        // Team members should use developer dashboard
        const redirectRole = user.role === 'team_member' ? 'developer' : user.role;
        router.replace(`/dashboard/${redirectRole}`);
      }
    }
  }, [router, requiredRole]);
}
