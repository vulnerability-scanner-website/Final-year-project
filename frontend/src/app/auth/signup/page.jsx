"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("developer");

  const handleRegister = (e) => {
    e.preventDefault();

    // Save fake user in localStorage
    const user = { email, password, role };
    localStorage.setItem("user", JSON.stringify(user));

    // Redirect to login
    router.push("/auth/login");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md p-6 rounded-2xl shadow-lg">
        <CardContent>
          <h1 className="text-2xl font-bold mb-6 text-center">
            Register
          </h1>

          <form onSubmit={handleRegister} className="space-y-4">
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

            {/* Role */}
            <select
              className="w-full border rounded-lg p-2"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="developer">Developer</option>
              <option value="admin">Admin</option>
            </select>

            {/* Register Button */}
            <Button
              type="submit"
              className="w-full bg-yellow-700 hover:bg-yellow-900 cursor-pointer"
            >
              Register
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}