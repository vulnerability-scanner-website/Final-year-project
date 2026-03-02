"use client"
import React from "react"
import AdminSideBar from "@/components/sidebar/AdminSideBar/Admin"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MessageSquare, Clock, Calendar } from "lucide-react"

export default function Page() {
  return (
    <div className="flex min-h-screen bg-muted/40">
      <AdminSideBar />

      <div className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Notifications</h1>
            <p className="text-muted-foreground mt-1">
              Stay updated with important information
            </p>
          </div>

          <Button variant="outline">Mark All Read</Button>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">

          {/* Notification 1 */}
          <Card className="rounded-2xl shadow-sm border bg-blue-50/40">
            <CardContent className="flex items-center justify-between p-6">
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-2 rounded-xl">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold">Department Meeting</h2>
                    <Badge className="h-2 w-2 rounded-full p-0 bg-blue-600" />
                  </div>

                  <p className="text-sm text-muted-foreground mt-1">
                    Supervisor provided feedback on your evaluation.
                  </p>

                  <p className="text-xs text-muted-foreground mt-2">
                    2 hours ago
                  </p>
                </div>
              </div>

              <Button variant="outline" size="sm">
                Mark Read
              </Button>
            </CardContent>
          </Card>

          {/* Notification 2 */}
          <Card className="rounded-2xl shadow-sm border bg-blue-50/30">
            <CardContent className="flex items-center justify-between p-6">
              <div className="flex items-start gap-4">
                <div className="bg-red-100 p-2 rounded-xl">
                  <Clock className="h-5 w-5 text-red-600" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold">Evaluation Due Tomorrow</h2>
                    <Badge className="h-2 w-2 rounded-full p-0 bg-blue-600" />
                  </div>

                  <p className="text-sm text-muted-foreground mt-1">
                    Final evaluation is due tomorrow at 11:59 PM
                  </p>

                  <p className="text-xs text-muted-foreground mt-2">
                    1 day ago
                  </p>
                </div>
              </div>

              <Button variant="outline" size="sm">
                Mark Read
              </Button>
            </CardContent>
          </Card>

          {/* Notification 3 */}
          <Card className="rounded-2xl shadow-sm border">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="bg-blue-100 p-2 rounded-xl">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>

              <div>
                <h2 className="font-semibold">Meeting Scheduled</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Department meeting scheduled for Friday at 2:00 PM
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  2 days ago
                </p>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Pagination */}
        <Separator className="my-8" />

        <div className="flex items-center justify-center gap-4 text-sm">
          <Button variant="ghost" size="sm">
            &lt; previous
          </Button>

          <Button variant="outline" size="sm" className="w-8 h-8 p-0">
            1
          </Button>

          <Button variant="ghost" size="sm">
            2
          </Button>

          <Button variant="ghost" size="sm">
            Next &gt;
          </Button>
        </div>
      </div>
    </div>
  )
}