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
  const [role, setRole] = useState("User"); // Default to User
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
    setRole("User");
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
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Enter user name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="role">Role</Label>
            <select
              id="role"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="Admin">Admin</option>
              <option value="Security Analyst">Security Analyst</option>
              <option value="User">Developer</option>
            </select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
          <Button 
            type="button"
            variant="outline" 
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            className="bg-[#003366] hover:bg-[#004080] text-white"
            disabled={!name || !role}
          >
            Save User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}