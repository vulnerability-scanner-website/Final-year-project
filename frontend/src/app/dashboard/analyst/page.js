"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Shield, Clock, CheckCircle, AlertCircle, Plus } from "lucide-react";

export default function Page() {
  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">My Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your security scans and vulnerabilities
          </p>
        </div>

        <Button className="gap-2">
          <Plus size={16} />
          New Scan
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="flex justify-between items-center p-6">
            <div>
              <p className="text-muted-foreground">My Scans</p>
              <h2 className="text-3xl font-bold">23</h2>
            </div>
            <div className="bg-blue-500/10 p-4 rounded-xl">
              <Shield className="text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex justify-between items-center p-6">
            <div>
              <p className="text-muted-foreground">In Progress</p>
              <h2 className="text-3xl font-bold">3</h2>
            </div>
            <div className="bg-yellow-500/10 p-4 rounded-xl">
              <Clock className="text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex justify-between items-center p-6">
            <div>
              <p className="text-muted-foreground">Completed</p>
              <h2 className="text-3xl font-bold">18</h2>
            </div>
            <div className="bg-green-500/10 p-4 rounded-xl">
              <CheckCircle className="text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex justify-between items-center p-6">
            <div>
              <p className="text-muted-foreground">Total Issues</p>
              <h2 className="text-3xl font-bold">45</h2>
            </div>
            <div className="bg-red-500/10 p-4 rounded-xl">
              <AlertCircle className="text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="bg-blue-100 p-4 rounded-xl">
              <Shield className="text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Start New Scan</h3>
              <p className="text-muted-foreground text-sm">Scan a new target</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="bg-purple-100 p-4 rounded-xl">
              <Shield className="text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">ML Testing</h3>
              <p className="text-muted-foreground text-sm">
                Use ML models for testing
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="bg-green-100 p-4 rounded-xl">
              <CheckCircle className="text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">View Reports</h3>
              <p className="text-muted-foreground text-sm">
                Check your scan reports
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Scans */}
      <Card>
        <CardHeader>
          <CardTitle>My Recent Scans</CardTitle>
          <CardDescription>Overview of your latest scans</CardDescription>
        </CardHeader>

        <Separator />

        <CardContent className="space-y-4 p-6">
          {/* Scan Item */}
          <div className="flex justify-between items-center border rounded-lg p-4">
            <div>
              <h4 className="font-semibold">Website Security Scan</h4>
              <p className="text-sm text-muted-foreground">
                Completed on March 1, 2026
              </p>
            </div>

            <div className="flex items-center gap-4">
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-700"
              >
                Completed
              </Badge>

              <span className="text-sm text-muted-foreground">5 issues</span>

              <Button variant="outline" size="sm">
                View
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
