"use client";

import { Component } from "@/components/ui/blog-posts";

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 py-12">
      <Component
        title="Our Most Popular Security Articles of 2024!"
        description="Discover the most engaging cybersecurity content from our expert security researchers"
        backgroundLabel="BLOG"
        backgroundPosition="left"
        posts={[
          {
            id: 1,
            title: "Advanced Penetration Testing Techniques for Modern Web Apps",
            category: "Penetration Testing",
            imageUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1600&h=840&fit=crop&q=80",
            views: 2180,
            readTime: 8,
            rating: 5
          },
          {
            id: 2,
            title: "Understanding SQL Injection Vulnerabilities",
            category: "Web Security",
            imageUrl: "https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=1600&h=840&fit=crop&q=80",
            views: 1456,
            readTime: 12,
            rating: 4
          },
          {
            id: 3,
            title: "AI-Powered Security Testing Best Practices",
            category: "AI Security",
            imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1600&h=840&fit=crop&q=80",
            views: 987,
            readTime: 6,
            rating: 4
          }
        ]}
        className="mb-16"
      />
    </div>
  );
}
