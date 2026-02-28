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
  const [name, setName] = useState("");
  const [status, setStatus] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");

  // When user changes, fill input fields
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setRole(user.role || "");
      setEmail(user.email || "");
      setStatus(user.status|| "");
    }
  }, [user]);

  const handleSubmit = () => {
    onUpdate({
      ...user,
      name,
      role,
      email,
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

        <div className="grid grid-cols-2 gap-2" >
          {/* Name */}
          <input
            type="text"
            placeholder="Full Name"
            className="w-full border p-2 rounded-md outline-none focus:ring-2 focus:ring-[#003366]/30"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          {/* Email */}
          <input
            type="email"
            placeholder="Email Address"
            className="w-full border p-2 rounded-md outline-none focus:ring-2 focus:ring-[#003366]/30"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* Role */}
          <input
            type="text"
            placeholder="Role"
            className="w-full border p-2 rounded-md outline-none focus:ring-2 focus:ring-[#003366]/30"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />
          <input
            type="text"
            placeholder="status"
            className="w-full border p-2 rounded-md outline-none focus:ring-2 focus:ring-[#003366]/30"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          />

          <Button className="w-full" onClick={handleSubmit}>
            Update User
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}