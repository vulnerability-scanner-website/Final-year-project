"use client"
import React, { useState } from "react"
import AdminSideBar from "@/components/sidebar/AdminSideBar/Admin"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MessageSquare, Clock, Calendar } from "lucide-react"

export default function Page() {
  const notificationsPerPage = 3

  // ✅ Move mock data into state
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Department Meeting",
      description: "Supervisor provided feedback on your evaluation.",
      time: "2 hours ago",
      icon: <MessageSquare className="h-5 w-5 text-blue-600" />,
      unread: true,
    },
    {
      id: 2,
      title: "Evaluation Due Tomorrow",
      description: "Final evaluation is due tomorrow at 11:59 PM",
      time: "1 day ago",
      icon: <Clock className="h-5 w-5 text-red-600" />,
      unread: true,
    },
    {
      id: 3,
      title: "Meeting Scheduled",
      description: "Department meeting scheduled for Friday at 2:00 PM",
      time: "2 days ago",
      icon: <Calendar className="h-5 w-5 text-blue-600" />,
      unread: false,
    },
    {
      id: 4,
      title: "New Announcement",
      description: "A new department policy has been published.",
      time: "3 days ago",
      icon: <MessageSquare className="h-5 w-5 text-blue-600" />,
      unread: true,
    },
    {
      id: 5,
      title: "System Update",
      description: "System maintenance scheduled this weekend.",
      time: "4 days ago",
      icon: <Clock className="h-5 w-5 text-red-600" />,
      unread: false,
    },
    {
      id: 6,
      title: "Reminder",
      description: "Submit your weekly report before Friday.",
      time: "5 days ago",
      icon: <Calendar className="h-5 w-5 text-blue-600" />,
      unread: false,
    },
  ])

  const totalPages = Math.ceil(notifications.length / notificationsPerPage)
  const [currentPage, setCurrentPage] = useState(1)

  const indexOfLast = currentPage * notificationsPerPage
  const indexOfFirst = indexOfLast - notificationsPerPage
  const currentNotifications = notifications.slice(
    indexOfFirst,
    indexOfLast
  )

  // ✅ Mark single notification as read
  const handleMarkRead = (id) => {
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, unread: false } : item
      )
    )
  }

  // ✅ Mark all notifications as read
  const handleMarkAllRead = () => {
    setNotifications((prev) =>
      prev.map((item) => ({ ...item, unread: false }))
    )
  }

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

          <Button variant="outline" onClick={handleMarkAllRead}>
            Mark All Read
          </Button>
        </div>

        {/* Notifications */}
        <div className="space-y-4">
          {currentNotifications.map((item) => (
            <Card
              key={item.id}
              className={`rounded-2xl shadow-sm border ${
                item.unread ? "bg-blue-50/40" : ""
              }`}
            >
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-2 rounded-xl">
                    {item.icon}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-semibold">{item.title}</h2>
                      {item.unread && (
                        <Badge className="h-2 w-2 rounded-full p-0 bg-blue-600" />
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground mt-1">
                      {item.description}
                    </p>

                    <p className="text-xs text-muted-foreground mt-2">
                      {item.time}
                    </p>
                  </div>
                </div>

                {item.unread && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMarkRead(item.id)}
                  >
                    Mark Read
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        <Separator className="my-8" />

        <div className="flex items-center justify-center gap-4 text-sm">
          <Button
            variant="ghost"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            &lt; Previous
          </Button>

          {[...Array(totalPages)].map((_, index) => (
            <Button
              key={index}
              variant={currentPage === index + 1 ? "outline" : "ghost"}
              size="sm"
              className="w-8 h-8 p-0"
              onClick={() => setCurrentPage(index + 1)}
            >
              {index + 1}
            </Button>
          ))}

          <Button
            variant="ghost"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            Next &gt;
          </Button>
        </div>
      </div>
    </div>
  )
}