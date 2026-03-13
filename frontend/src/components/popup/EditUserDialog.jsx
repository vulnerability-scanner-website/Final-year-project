"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function EditUserDialog({ open, onOpenChange, user, onUserUpdated }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setEmail(user.email || "");
      setRole(user.role || "");
      setStatus(user.status || "");
    }
  }, [user]);

  const handleSubmit = async () => {
    if (!user || !email || !role) return;

    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ email, role, status }),
      });

      if (res.ok) {
        onOpenChange(false);
        onUserUpdated();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to update user");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              placeholder="Email Address"
              className="w-full border p-2 rounded-md outline-none focus:ring-2 focus:ring-[#003366]/30"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select
              className="w-full border p-2 rounded-md outline-none focus:ring-2 focus:ring-[#003366]/30"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="admin">Admin</option>
              <option value="analyst">Analyst</option>
              <option value="developer">Developer</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              className="w-full border p-2 rounded-md outline-none focus:ring-2 focus:ring-[#003366]/30"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <Button 
            className="w-full bg-[#003366] hover:bg-[#004080]" 
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Updating..." : "Update User"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
