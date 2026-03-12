"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function EditUserDialog({ open, setOpen, user, onUpdate }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [role, setRole] = useState("");

  // When user changes, fill input fields
  useEffect(() => {
    if (user) {
      setEmail(user.email || "");
      setRole(user.role || "");
      setStatus(user.status || "");
    }
  }, [user]);

  const handleSubmit = () => {
    onUpdate({
      ...user,
      email,
      role,
      status
    });
    setOpen(false);
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Email */}
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

          {/* Role */}
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

          {/* Status */}
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

          <Button className="w-full bg-[#003366] hover:bg-[#004080]" onClick={handleSubmit}>
            Update User
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}