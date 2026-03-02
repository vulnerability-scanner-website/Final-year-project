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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Users, UserCheck, Scan, Edit, Trash2 } from "lucide-react";

import AdminSideBar from "@/components/sidebar/AdminSideBar/Admin";
import { DashboardHeader } from "@/components/header/header";
import AddUserDialog from "@/components/popup/AddUserDialog";
import EditUserDialog from "@/components/popup/EditUserDialog";

export default function UsersDashboard() {
  // ================= USERS STATE =================
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

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

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

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesStatus = statusFilter === "" || user.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleAddUser = (newUser) => {
    setUsers((prev) => [...prev, newUser]);
    setOpen(false);
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setEditOpen(true);
  };

  const handleUpdateUser = (updatedUser) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)),
    );
  };

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setDeleteOpen(true);
  };

  const confirmDelete = () => {
    setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
    setDeleteOpen(false);
  };

  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSideBar />

      <div className="flex-1 ml-64">
        <DashboardHeader
          role="usermanagement"
          onActionClick={() => setOpen(true)}
        />

        <AddUserDialog
          open={open}
          setOpen={setOpen}
          onAddUser={handleAddUser}
        />
        <EditUserDialog
          open={editOpen}
          setOpen={setEditOpen}
          user={selectedUser}
          onUpdate={handleUpdateUser}
        />

        <main className="my-6 ">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6  ">
            <Card className="shadow-md shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border-yellow-400 border">
              <CardContent className="p-5 flex justify-between items-center ">
                <div>
                  <p className="text-sm text-gray-500">Total Users</p>
                  <p className="text-3xl font-bold">{users.length}</p>
                </div>
                <Users className="w-6 h-6 text-[#003366]" />
              </CardContent>
            </Card>

            <Card className="shadow-md shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border-yellow-400 border">
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

            <Card className="shadow-md shadow-sm hover:border-yellow-400 border shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border-yellow-400 border">
              <CardContent className="p-6 flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">Inactive Users</p>
                  <p className="text-3xl font-bold">
                    {users.filter((u) => u.status === "Inactive").length}
                  </p>
                </div>
                <Scan className="w-6 h-6 text-purple-600" />
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-md mb-6">
            <CardContent className="flex flex-col md:flex-row gap-3 p-2">
              <input
                type="text"
                placeholder="Search by name..."
                className="w-full border border-gray-300 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/20 pl-4 rounded-md outline-none transition"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <select
                className="w-full md:w-64 border border-gray-300 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/20 px-4 py-2 rounded-md outline-none transition text-[#003366] bg-white"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Inactive">Inactive</option>
              </select>
            </CardContent>
          </Card>

          {/* ================= USERS TABLE ================= */}
          <Card className="shadow-md overflow-hidden px-8">
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
                  {currentUsers.map((user, index) => (
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
                        <div className="flex items-center gap-3">
                          <Button
                            className="cursor-pointer"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(user)}
                          >
                            <Edit className="w-4 h-4 text-[#003366] " />
                          </Button>

                          <Button
                            className="cursor-pointer"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(user)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>

                          <Switch
                            checked={user.status === "Active"}
                            onCheckedChange={() => handleToggleStatus(user.id)}
                            disabled={user.status === "Pending"}
                            className="cursor-pointer data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-yellow-950"
                          />
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

          <div className="flex justify-center items-center mt-4 px-4">

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
              >
                Previous
              </Button>

              {Array.from({ length: totalPages }, (_, i) => (
                <Button
                  key={i}
                  size="sm"
                  variant={currentPage === i + 1 ? "default" : "outline"}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}

              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
              >
                Next
              </Button>
            </div>
          </div>

          <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete{" "}
                  <span className="font-semibold text-red-600">
                    {selectedUser?.name}
                  </span>
                  .
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={confirmDelete}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </main>
      </div>
    </div>
  );
}
