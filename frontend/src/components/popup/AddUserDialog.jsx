"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AddUserDialog({ open, setOpen, onAddUser }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("Active");

  const handleSubmit = () => {
    if (!name || !role) return;

    const newUser = {
      id: Date.now(),
      name,
      role,
      status,
    };

    onAddUser(newUser);

    // Reset form
    setName("");
    setRole("");
    setStatus("Active");
    setOpen(false); // close dialog after adding
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div>
            <Label>Name</Label>
            <Input
              placeholder="Enter user name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <Label>Role</Label>
            <Input
              placeholder="Enter role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </div>

          <div>
            <Label>Status</Label>
            <select
              className="w-full border rounded-md px-3 py-2"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit} className="bg-[#003366] hover:bg-[#004080] text-white">
            Save User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}