"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, UserCheck, Scan, Plus, Edit, Trash2 } from "lucide-react";

import AdminSideBar from "@/components/sidebar/AdminSideBar/Admin";

export default function UsersDashboard() {
  // Sample data
  const stats = {
    totalUsers: 15,
    activeUsers: 14,
    totalScans: 100,
  };

  const users = [
    { id: 1, name: "John Doe", role: "Admin", status: "Active" },
    {
      id: 2,
      name: "Sarah Johnson",
      role: "Security Analyst",
      status: "Active",
    },
    { id: 3, name: "Michael Chen", role: "User", status: "Pending" },
    { id: 4, name: "Emily Brown", role: "Security Analyst", status: "Active" },
    { id: 5, name: "David Wilson", role: "User", status: "Inactive" },
    { id: 6, name: "Lisa Anderson", role: "Admin", status: "Active" },
    { id: 7, name: "James Martinez", role: "User", status: "Active" },
  ];

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesStatus = statusFilter === "" || user.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleEdit = (userId, userName) => {
    alert(`Editing ${userName}`);
  };

  const handleDelete = (userId, userName) => {
    if (window.confirm(`Are you sure you want to delete ${userName}?`)) {
      alert(`${userName} has been deleted`);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSideBar />

      <div className="flex-1 ml-64">
        <header>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-800">
              Users Management
            </h1>
            <Button className="bg-[#003366] hover:bg-[#004080] text-white">
              <Plus className="w-4 h-4 mr-2" />
              New User
            </Button>
          </div>
        </header>

        <main className="pt-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <Card className="shadow-md">
              <CardContent className="p-6 flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">Total Users</p>
                  <p className="text-3xl font-bold">{stats.totalUsers}</p>
                </div>
                <Users className="w-6 h-6 text-[#003366]" />
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardContent className="p-6 flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">Active Users</p>
                  <p className="text-3xl font-bold">{stats.activeUsers}</p>
                </div>
                <UserCheck className="w-6 h-6 text-green-600" />
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardContent className="p-6 flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">Total Scans</p>
                  <p className="text-3xl font-bold">{stats.totalScans}</p>
                </div>
                <Scan className="w-6 h-6 text-purple-600" />
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-md mb-6">
            <CardContent className="">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search by name..."
                    className="w-full border border-gray-300 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/20 px-4 py-2 rounded-md outline-none transition"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <div className="w-full md:w-64">
                  <select
                    className="w-full border border-gray-300 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/20 px-4 py-2 rounded-md outline-none transition"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>UserId</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user, index) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        {(index + 1).toString().padStart(2, "0")}
                      </TableCell>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.status === "Active"
                              ? "bg-green-100 text-green-800"
                              : user.status === "Pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {user.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(user.id, user.name)}
                          >
                            <Edit className="w-4 h-4 text-[#003366]" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(user.id, user.name)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}

                  {filteredUsers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6">
                        No users found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
}
