"use client";

import { useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Users, UserCheck, UserX, Edit, Trash2, Plus } from "lucide-react";

import AdminSideBar from "@/components/sidebar/AdminSideBar/Admin";
import { DashboardHeader } from "@/components/header/header";
import AddUserDialog from "@/components/popup/AddUserDialog";

export default function UsersDashboard() {
  const [users, setUsers] = useState([
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
  ]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [open, setOpen] = useState(false);

  const handleToggleStatus = (userId) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId
          ? {
              ...user,
              status: user.status === "Active" ? "Inactive" : "Active",
            }
          : user,
      ),
    );
  };

  const handleDelete = (userId) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSideBar />

      <div className="flex-1 ml-64">
        <DashboardHeader
          role="usermanagement"
          onActionClick={() => setOpen(true)}
        />

        <AddUserDialog
          open={open}
          setOpen={setOpen}
          onAddUser={(newUser) => setUsers((prev) => [...prev, newUser])}
        />

        <main className="my-6 ">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="shadow-md">
              <CardContent className="p-5 flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-3xl font-bold">{users.length}</p>
                </div>
                <Users className="w-7 h-7 text-[#003366]" />
              </CardContent>
            </Card>

            <Card className="border-none shadow-md hover:shadow-lg transition">
              <CardContent className="p-6 flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                  <p className="text-3xl font-bold text-green-600">
                    {activeUsers}
                  </p>
                </div>
                <UserCheck className="w-7 h-7 text-green-600" />
              </CardContent>
            </Card>

            <Card className="border-none shadow-md hover:shadow-lg transition">
              <CardContent className="p-6 flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">Deactive Users</p>
                  <p className="text-3xl font-bold">
                    {users.filter((u) => u.status === "Inactive").length}
                  </p>
                </div>
                <UserX className="w-7 h-7 text-red-600" />
              </CardContent>
            </Card>
          </div>

          {/* ---------------- FILTER BAR ---------------- */}
          <Card className="border-none shadow-md">
            <CardContent className="p-6 flex flex-col md:flex-row gap-4">
              <Input
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="focus-visible:ring-[#003366]"
              />

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#003366]"
              >
                <option value="">All Status</option>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Inactive">Inactive</option>
              </select>

              <Button
                className="bg-[#003366] hover:bg-[#00264d]"
                onClick={() => setOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </CardContent>
          </Card>

          {/* ---------------- USERS TABLE ---------------- */}
          <Card className="border-none shadow-md">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredUsers.map((user, index) => (
                    <TableRow
                      key={user.id}
                      className="hover:bg-slate-100 transition"
                    >
                      <TableCell>
                        {(index + 1).toString().padStart(2, "0")}
                      </TableCell>

                      <TableCell className="font-medium">{user.name}</TableCell>

                      <TableCell>{user.role}</TableCell>

                      <TableCell>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.status === "Active"
                              ? "bg-green-100 text-green-700"
                              : user.status === "Pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                          }`}
                        >
                          {user.status}
                        </span>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex justify-end items-center gap-3">
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4 text-[#003366]" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(user.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>

                          <Switch
                            checked={user.status === "Active"}
                            onCheckedChange={() => handleToggleStatus(user.id)}
                            className="data-[state=checked]:bg-green-600"
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}

                  {filteredUsers.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-8 text-muted-foreground"
                      >
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
