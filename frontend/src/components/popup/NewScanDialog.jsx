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

const FormSchema = z.object({
  scanName: z.string().min(1, 'Scan name is required').max(100, 'Scan name cannot exceed 100 characters'),
  targetUrl: z.string().url('Please enter a valid URL').min(1, 'Target URL is required'),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
});

export default function NewScanDialog({ open, onOpenChange }) {
  const direction = useDirection();

  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: { 
      scanName: '', 
      targetUrl: '',
      description: ''
    },
    mode: 'onSubmit',
  });

  function onSubmit(data) {
    // Get existing scans from localStorage
    const existingScans = JSON.parse(localStorage.getItem('scans') || '[]');
    
    // Create new scan object
    const newScan = {
      id: Date.now(),
      name: data.scanName,
      target: data.targetUrl,
      description: data.description,
      status: 'Running',
      progress: 0,
      started: 'Just now',
      createdAt: new Date().toISOString()
    };
    
    // Add to scans array
    existingScans.push(newScan);
    localStorage.setItem('scans', JSON.stringify(existingScans));
    
    toast.custom((t) => (
      <Alert variant="mono" icon="primary" onClose={() => toast.dismiss(t)}>
        <AlertIcon>
          <RiCheckboxCircleFill />
        </AlertIcon>
        <AlertTitle>Scan "{data.scanName}" initiated successfully</AlertTitle>
      </Alert>
    ));

    form.reset();
    onOpenChange(false);
    
    // Trigger storage event for other components to update
    window.dispatchEvent(new Event('storage'));
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
