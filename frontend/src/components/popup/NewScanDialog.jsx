"use client";

import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert-1';
import { Button } from '@/components/ui/button-1';
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDirection } from '@radix-ui/react-direction';
import { RiCheckboxCircleFill } from '@remixicon/react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

const FormSchema = z.object({
  scanName: z.string().min(1, 'Scan name is required').max(100, 'Scan name cannot exceed 100 characters'),
  targetUrl: z.string().url('Please enter a valid URL').min(1, 'Target URL is required'),
  scanType: z.enum(['full', 'zap', 'nuclei', 'nikto']).default('zap'),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
});

export default function NewScanDialog({ open, onOpenChange }) {
  const direction = useDirection();

  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: { 
      scanName: '', 
      targetUrl: '',
      scanType: 'zap',
      description: ''
    },
    mode: 'onSubmit',
  });

  async function onSubmit(data) {
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Please login first');
        return;
      }
      
      // Call backend API to start scan
      const response = await fetch(`${API_URL}/api/scans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          target: data.targetUrl,
          scanType: data.scanType
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to start scan');
      }

      const scan = await response.json();
      console.log('Scan started:', scan);
      
      toast.custom((t) => (
        <Alert variant="mono" icon="primary" onClose={() => toast.dismiss(t)}>
          <AlertIcon>
            <RiCheckboxCircleFill />
          </AlertIcon>
          <AlertTitle>Scan "{data.scanName}" initiated successfully (ID: {scan.id})</AlertTitle>
        </Alert>
      ));

      form.reset();
      onOpenChange(false);
      
      // Trigger refresh
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      console.error('Scan error:', error);
      toast.error('Failed to start scan: ' + error.message);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir={direction}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Create New Security Scan</DialogTitle>
              <DialogDescription>Configure your vulnerability scan settings</DialogDescription>
            </DialogHeader>
            <DialogBody className="space-y-4">
              <FormField
                control={form.control}
                name="scanName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scan Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Production Website Scan" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="targetUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com" {...field} />
                    </FormControl>
                    <FormDescription>Enter the URL you want to scan for vulnerabilities</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="scanType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scan Type</FormLabel>
                    <FormControl>
                      <select {...field} className="w-full px-3 py-2 border rounded-md">
                        <option value="zap">ZAP - OWASP ZAP (Recommended - Most Comprehensive)</option>
                        <option value="nuclei">Nuclei (Fast Vulnerability Templates)</option>
                        <option value="nikto">Nikto (Web Server Checks)</option>
                        <option value="full">Full Scan (All Tools)</option>
                      </select>
                    </FormControl>
                    <FormDescription>Choose the type of security scan to perform</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Add notes about this scan..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </DialogBody>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">Start Scan</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
