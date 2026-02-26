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
import { Users, UserCheck, Scan, Edit, Trash2 } from "lucide-react";

import AdminSideBar from "@/components/sidebar/AdminSideBar/Admin";
import { DashboardHeader } from "@/components/header/header";
import AddUserDialog from "@/components/popup/AddUserDialog";

export default function UsersDashboard() {
  // Users state
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
    { id: 6, name: "Lisa Anderson", role: "Admin", status: "Active" },
    { id: 7, name: "James Martinez", role: "User", status: "Active" },
  ]);

  // Filter state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Dialog open state
  const [open, setOpen] = useState(false);

  // Filter logic
  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesStatus = statusFilter === "" || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Handlers
  const handleAddUser = (newUser) => {
    setUsers((prev) => [...prev, newUser]);
    setOpen(false); // close dialog after adding
  };

  const handleEdit = (userId, userName) => {
    alert(`Edit ${userName}`);
  };

  const handleDelete = (userId, userName) => {
    if (window.confirm(`Are you sure you want to delete ${userName}?`)) {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      alert(`${userName} deleted`);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSideBar />

      <div className="flex-1 ml-64 cursor-pointer">
        {/* ONLY ONE BUTTON - in the DashboardHeader */}
        <DashboardHeader
          role="usermanagement"
          onActionClick={() => setOpen(true)} // Opens dialog
        />

        <AddUserDialog
          open={open} // Controlled by Dashboard
          setOpen={setOpen} // Allows closing
          onAddUser={handleAddUser}
        />
        <main className="my-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
            <Card className="shadow-md">
              <CardContent className="p-5 flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">Total Users</p>
                  <p className="text-3xl font-bold">{users.length}</p>
                </div>
                <Users className="w-6 h-6 text-[#003366]" />
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardContent className="p-6 flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">Active Users</p>
                  <p className="text-3xl font-bold">
                    {users.filter((u) => u.status === "Active").length}
                  </p>
                </div>
                <UserCheck className="w-6 h-6 text-green-600" />
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardContent className="p-6 flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">Total Scans</p>
                  <p className="text-3xl font-bold">100</p>
                </div>
                <Scan className="w-6 h-6 text-purple-600" />
              </CardContent>
            </Card>
          </div>

          {/* Filter Section */}
          <Card className="shadow-md mb-6">
            <CardContent className=" flex flex-col md:flex-row md:items-center md:justify-between gap-4">
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
            </CardContent>
          </Card>

          {/* Users Table */}
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
