"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogBody } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import UpgradePlanModal from '@/components/popup/UpgradePlanModal';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

const FormSchema = z.object({
  scanName:    z.string().min(1, 'Scan name is required').max(100),
  targetUrl:   z.string().url('Please enter a valid URL'),
  scanType:    z.enum(['full', 'zap', 'nuclei', 'nikto']).default('zap'),
  description: z.string().max(500).optional(),
});

export default function NewScanDialog({ open, onOpenChange, role }) {
  const [submitting, setSubmitting] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [scansUsed, setScansUsed] = useState(3);

  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: { scanName: '', targetUrl: '', scanType: 'zap', description: '' },
    mode: 'onSubmit',
  });

  async function onSubmit(data) {
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) { toast.error('Please login first'); return; }

      const res = await fetch(`${API}/api/scans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ target: data.targetUrl, scanType: data.scanType }),
      });

      const result = await res.json();

      // Free plan limit reached
      if (!res.ok && result.upgrade_required) {
        setScansUsed(result.scans_used || 3);
        onOpenChange(false);
        setShowUpgrade(true);
        return;
      }

      if (!res.ok) {
        throw new Error(result.error || 'Failed to start scan');
      }

      toast.success(`Scan started for ${data.targetUrl}`);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to start scan: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass = "w-full mt-1 bg-[#101010] border border-white/10 text-white placeholder-white/30 px-3 py-2 rounded-lg focus:outline-none focus:border-yellow-500 transition text-sm";

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md bg-[#1a1a1a] border border-white/10 text-white">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <DialogHeader>
                <DialogTitle className="text-white">New Security Scan</DialogTitle>
                <DialogDescription className="text-white/40">Configure your vulnerability scan settings</DialogDescription>
              </DialogHeader>

              <DialogBody className="space-y-4 py-4">
                <FormField control={form.control} name="scanName" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/70 text-xs">Scan Name</FormLabel>
                    <FormControl><input placeholder="e.g., Production Website Scan" className={inputClass} {...field} /></FormControl>
                    <FormMessage className="text-red-400 text-xs" />
                  </FormItem>
                )} />

                <FormField control={form.control} name="targetUrl" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/70 text-xs">Target URL</FormLabel>
                    <FormControl><input placeholder="https://example.com" className={inputClass} {...field} /></FormControl>
                    <FormDescription className="text-white/30 text-xs">URL to scan for vulnerabilities</FormDescription>
                    <FormMessage className="text-red-400 text-xs" />
                  </FormItem>
                )} />

                <FormField control={form.control} name="scanType" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/70 text-xs">Scan Type</FormLabel>
                    <FormControl>
                      <select {...field} className={inputClass}>
                        <option value="zap">ZAP — OWASP ZAP (Recommended)</option>
                        <option value="nuclei">Nuclei — Fast Template Scan</option>
                        <option value="nikto">Nikto — Web Server Checks</option>
                        <option value="full">Full — All Tools Combined</option>
                      </select>
                    </FormControl>
                    <FormMessage className="text-red-400 text-xs" />
                  </FormItem>
                )} />

                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/70 text-xs">Description (Optional)</FormLabel>
                    <FormControl><textarea placeholder="Add notes about this scan..." className={`${inputClass} resize-none`} rows={2} {...field} /></FormControl>
                    <FormMessage className="text-red-400 text-xs" />
                  </FormItem>
                )} />
              </DialogBody>

              <DialogFooter className="gap-2">
                <DialogClose asChild>
                  <button type="button" className="px-4 py-2 text-sm border border-white/10 text-white/60 hover:text-white rounded-lg transition">
                    Cancel
                  </button>
                </DialogClose>
                <button type="submit" disabled={submitting} className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-black font-semibold px-4 py-2 rounded-lg transition text-sm">
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {submitting ? 'Starting...' : 'Start Scan'}
                </button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Upgrade modal shown when free limit is hit */}
      <UpgradePlanModal
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        scansUsed={scansUsed}
        role={role}
      />
    </>
  );
}
