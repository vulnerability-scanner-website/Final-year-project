"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (!storedUser) {
      setError("No registered user found. Please register first.");
      return;
    }

    if (storedUser.email === email && storedUser.password === password) {
      // Successful login → store session
      localStorage.setItem("session", JSON.stringify(storedUser));

      // Redirect based on role
      if (storedUser.role === "admin") {
        router.push("/dashboard/admin");
      } else if (storedUser.role === "developer") {
        router.push("/dashboard/developer");
      } else {
        router.push("/");
      }
    } else {
      setError("Invalid email or password.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md p-6 rounded-2xl shadow-lg">
        <CardContent>
          <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <input
              type="email"
              placeholder="Email"
              className="w-full border rounded-lg p-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {/* Password */}
            <input
              type="password"
              placeholder="Password"
              className="w-full border rounded-lg p-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <Button
              type="submit"
              className="w-full bg-yellow-700 hover:bg-yellow-900 cursor-pointer"
            >
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}