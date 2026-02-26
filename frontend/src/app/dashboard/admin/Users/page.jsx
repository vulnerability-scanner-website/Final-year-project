"use client";

import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, UserCheck, Scan, Plus, Edit, Trash2 } from "lucide-react";

import AdminSideBar from "@/components/sidebar/AdminSideBar/Admin";

export default function UsersDashboard() {
  // Sample data - replace with actual data from your backend
  const stats = {
    totalUsers: 15,
    activeUsers: 14,
    totalScans: 100
  };

  // Sample users data with more entries to show numbering
  const users = [
    { id: 1, name: "John Doe", role: "Admin", status: "Active" },
    { id: 2, name: "Sarah Johnson", role: "Security Analyst", status: "Active" },
    { id: 3, name: "Michael Chen", role: "User", status: "Pending" },
    { id: 4, name: "Emily Brown", role: "Security Analyst", status: "Active" },
    { id: 5, name: "David Wilson", role: "User", status: "Inactive" },
    { id: 6, name: "Lisa Anderson", role: "Admin", status: "Active" },
    { id: 7, name: "James Martinez", role: "User", status: "Active" },
  ];

  const handleEdit = (userId, userName) => {
    console.log(`Edit user: ${userName} (ID: ${userId})`);
    // Add your edit logic here
    alert(`Editing ${userName}`);
  };

  const handleDelete = (userId, userName) => {
    console.log(`Delete user: ${userName} (ID: ${userId})`);
    // Add your delete logic here (with confirmation dialog)
    if (window.confirm(`Are you sure you want to delete ${userName}?`)) {
      // Proceed with deletion
      console.log(`User ${userName} deleted`);
      alert(`${userName} has been deleted`);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar - fixed width */}
      <AdminSideBar />

      {/* Main content - takes remaining width with left margin to account for fixed sidebar */}
      <div className="flex-1 ml-64">
        {/* Header */}
        <header className=" ">
          <div className="flex items-center justify-between  ">
            <h1 className="text-2xl font-semibold text-gray-800 ">Users Management</h1>
            <Button className="bg-[#003366] hover:bg-[#004080] text-white cursor-pointer">
              <Plus className="w-4 h-4 mr-2 " />
              New User
            </Button>
          </div>
        </header>

        {/* Main content area */}
        <main className="pt-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {/* Total Users Card */}
            <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Total Users</p>
                    <p className="text-3xl font-bold text-gray-800">{stats.totalUsers}</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <Users className="w-6 h-6 text-[#003366]" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Users Card */}
            <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Active Users</p>
                    <p className="text-3xl font-bold text-gray-800">{stats.activeUsers}</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <UserCheck className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total Scans Card */}
            <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Total Scans</p>
                    <p className="text-3xl font-bold text-gray-800">{stats.totalScans}</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <Scan className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Users Table with Numbers */}
          <Card className="border-none shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="font-semibold text-gray-600 py-4 w-16">#</TableHead>
                    <TableHead className="font-semibold text-gray-600 py-4">User</TableHead>
                    <TableHead className="font-semibold text-gray-600 py-4">Role</TableHead>
                    <TableHead className="font-semibold text-gray-600 py-4">Status</TableHead>
                    <TableHead className="font-semibold text-gray-600 py-4">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user, index) => (
                    <TableRow key={user.id} className="hover:bg-gray-50">
                      <TableCell className="py-4 text-gray-500 font-mono">
                        {(index + 1).toString().padStart(2, '0')}
                      </TableCell>
                      <TableCell className="font-medium py-4">{user.name}</TableCell>
                      <TableCell className="py-4">{user.role}</TableCell>
                      <TableCell className="py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          user.status === 'Active' ? 'bg-green-100 text-green-800' :
                          user.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {user.status}
                        </span>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(user.id, user.name)}
                            className="text-[#003366] hover:text-[#004080] hover:bg-blue-50 p-2 h-8 w-8"
                            title="Edit User"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(user.id, user.name)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 h-8 w-8"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
}