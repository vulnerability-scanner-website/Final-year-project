"use client";
import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function GoogleSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const token = searchParams.get("token");
    const role = searchParams.get("role");

    if (token) {
      localStorage.setItem("token", token);
      
      if (role === "admin") {
        router.push("/dashboard/admin");
      } else if (role === "analyst") {
        router.push("/dashboard/analyst");
      } else {
        router.push("/dashboard/developer");
      }
    } else {
      router.push("/auth/login?error=no_token");
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Completing Google sign in...</p>
      </div>
    </div>
  );
}
