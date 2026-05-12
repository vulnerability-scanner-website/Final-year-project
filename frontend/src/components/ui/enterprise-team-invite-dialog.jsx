"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Check, Copy, UserRoundPlus, AlertCircle, X } from "lucide-react";
import { useId, useRef, useState } from "react";

export function EnterpriseTeamInviteDialog({ open, onOpenChange, onSuccess }) {
  const id = useId();
  const [members, setMembers] = useState([{ email: "", password: "" }]);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const inputRef = useRef(null);
  const lastInputRef = useRef(null);

  const addMember = () => {
    if (members.length < 5) {
      setMembers([...members, { email: "", password: "" }]);
    }
  };

  const removeMember = (index) => {
    if (members.length > 1) {
      setMembers(members.filter((_, i) => i !== index));
    }
  };

  const handleMemberChange = (index, field, value) => {
    const newMembers = [...members];
    newMembers[index][field] = value;
    setMembers(newMembers);
  };

  const handleCopy = () => {
    if (inputRef.current) {
      navigator.clipboard.writeText(inputRef.current.value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    const validMembers = members.filter(m => m.email && m.password);

    if (validMembers.length === 0) {
      setError("Please add at least one team member");
      setIsLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const response = await fetch(`${API}/api/team/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ members: validMembers }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to invite team members");
      }

      setSuccess(`Successfully invited ${data.invited.length} team member(s)!`);
      setMembers([{ email: "", password: "" }]);
      
      if (onSuccess) {
        onSuccess(data);
      }

      setTimeout(() => {
        onOpenChange(false);
        setSuccess("");
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          lastInputRef.current?.focus();
        }}
      >
        <div className="flex flex-col gap-2">
          <div
            className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border bg-orange-50"
            aria-hidden="true"
          >
            <UserRoundPlus className="text-orange-500" size={16} strokeWidth={2} />
          </div>
          <DialogHeader>
            <DialogTitle className="text-left">Invite Team Members</DialogTitle>
            <DialogDescription className="text-left">
              Add up to 5 team members to your Enterprise plan. Each member gets their own login credentials.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="text-blue-600" size={16} />
            <span className="text-blue-900">
              Team members will use the same login page with their credentials
            </span>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-600">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-4">
            <Label>Team Member Credentials</Label>
            <div className="space-y-3">
              {members.map((member, index) => (
                <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-3 p-3 border rounded-lg bg-gray-50">
                  <div>
                    <Label htmlFor={`email-${index}`} className="text-xs text-gray-600">
                      Email
                    </Label>
                    <Input
                      id={`email-${index}`}
                      placeholder="member@company.com"
                      type="email"
                      value={member.email}
                      onChange={(e) => handleMemberChange(index, "email", e.target.value)}
                      ref={index === members.length - 1 ? lastInputRef : undefined}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`password-${index}`} className="text-xs text-gray-600">
                      Password
                    </Label>
                    <Input
                      id={`password-${index}`}
                      placeholder="Min 8 characters"
                      type="password"
                      value={member.password}
                      onChange={(e) => handleMemberChange(index, "password", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  {members.length > 1 && (
                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMember(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <X size={18} />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {members.length < 5 && (
              <button
                type="button"
                onClick={addMember}
                className="text-sm text-orange-500 hover:text-orange-600 underline hover:no-underline"
              >
                + Add another member ({members.length}/5)
              </button>
            )}
          </div>
          <Button type="submit" className="btn-primary w-full" disabled={isLoading}>
            {isLoading ? "Sending Invites..." : "Send Invites"}
          </Button>
        </form>

        <hr className="my-1 border-t border-border" />

        <div className="space-y-2">
          <Label htmlFor={id}>Share Login Page</Label>
          <p className="text-xs text-gray-500">
            Team members use this page to login with their credentials
          </p>
          <div className="relative">
            <Input
              ref={inputRef}
              id={id}
              className="pe-9"
              type="text"
              defaultValue={typeof window !== 'undefined' ? `${window.location.origin}/auth/login` : ''}
              readOnly
            />
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleCopy}
                    className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg border border-transparent text-muted-foreground/80 outline-offset-2 transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:cursor-not-allowed"
                    aria-label={copied ? "Copied" : "Copy to clipboard"}
                    disabled={copied}
                  >
                    <div
                      className={cn(
                        "transition-all",
                        copied ? "scale-100 opacity-100" : "scale-0 opacity-0"
                      )}
                    >
                      <Check
                        className="stroke-emerald-500"
                        size={16}
                        strokeWidth={2}
                        aria-hidden="true"
                      />
                    </div>
                    <div
                      className={cn(
                        "absolute transition-all",
                        copied ? "scale-0 opacity-0" : "scale-100 opacity-100"
                      )}
                    >
                      <Copy size={16} strokeWidth={2} aria-hidden="true" />
                    </div>
                  </button>
                </TooltipTrigger>
                <TooltipContent className="px-2 py-1 text-xs">Copy to clipboard</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
