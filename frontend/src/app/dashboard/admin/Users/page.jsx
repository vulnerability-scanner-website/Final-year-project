"use client";

import { useState, useEffect } from "react";
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

import { DashboardHeader } from "@/components/header/header";
import AddUserDialog from "@/components/popup/AddUserDialog";
import EditUserDialog from "@/components/popup/EditUserDialog";

export default function UsersDashboard() {

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/users`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setUsers([]);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      const res = await fetch(`${API_URL}/api/admin/users/${userId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      const res = await fetch(`${API_URL}/api/admin/users/${userToDelete}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (res.ok) {
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteOpen(false);
      setUserToDelete(null);
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditOpen(true);
  };

  const openDeleteDialog = (userId) => {
    setUserToDelete(userId);
    setDeleteOpen(true);
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.email
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "" || user.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const usersPerPage = 5;

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;

  const currentUsers = filteredUsers.slice(
    indexOfFirstUser,
    indexOfLastUser
  );

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  return (
    <div className="min-h-screen bg-[#101010] text-white">
      <div className="w-full">
        <DashboardHeader
          className="border-b border-yellow-400/70 mb-4 px-4 py-4 flex items-center justify-between"
          role="usermanagement"
          onActionClick={() => setOpen(true)}
        />

        <main className="space-y-6 p-4">

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

            <div className="bg-[#1a1a1a] border border-yellow-500/20 rounded-xl p-5 flex justify-between items-center">
              <div>
                <p className="text-sm text-yellow-400/70">Total Users</p>
                <p className="text-3xl font-bold text-yellow-400">{users.length}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-500/10 rounded-full flex items-center justify-center">
                <Users className="text-yellow-400" size={22} />
              </div>
            </div>

            <div className="bg-[#1a1a1a] border border-orange-500/20 rounded-xl p-5 flex justify-between items-center">
              <div>
                <p className="text-sm text-orange-400/70">Active Users</p>
                <p className="text-3xl font-bold text-orange-400">
                  {users.filter((u) => u.status === "active").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center">
                <UserCheck className="text-orange-400" size={22} />
              </div>
            </div>

            <div className="bg-[#1a1a1a] border border-yellow-500/20 rounded-xl p-5 flex justify-between items-center">
              <div>
                <p className="text-sm text-yellow-400/70">Inactive Users</p>
                <p className="text-3xl font-bold text-white">
                  {users.filter((u) => u.status === "inactive").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center">
                <Scan className="text-white/50" size={22} />
              </div>
            </div>

          </div>

          {/* Search */}
          <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4 flex flex-col md:flex-row gap-3">
            <input
              type="text"
              placeholder="Search by email..."
              className="bg-[#101010] border border-white/10 text-white placeholder-white/30 p-2 rounded-lg w-full focus:outline-none focus:border-yellow-500 transition"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="bg-[#101010] border border-white/10 text-white p-2 rounded-lg md:w-64 focus:outline-none focus:border-yellow-500 transition"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Table */}
          <div className="bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden">
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-white/10 hover:bg-transparent">
                    <TableHead className="text-yellow-400 font-semibold">ID</TableHead>
                    <TableHead className="text-yellow-400 font-semibold">Email</TableHead>
                    <TableHead className="text-yellow-400 font-semibold">Role</TableHead>
                    <TableHead className="text-yellow-400 font-semibold">Status</TableHead>
                    <TableHead className="text-yellow-400 font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {currentUsers.map((user, index) => (
                    <TableRow key={user.id} className="border-b border-white/5 hover:bg-white/5 transition">

                      <TableCell className="text-white/50 font-mono text-sm">
                        {(indexOfFirstUser + index + 1).toString().padStart(2, "0")}
                      </TableCell>

                      <TableCell className="text-white break-all">
                        {user.email}
                      </TableCell>

                      <TableCell>
                        <span className="text-orange-400 font-medium capitalize">{user.role}</span>
                      </TableCell>

                      <TableCell>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          user.status === "active"
                            ? "bg-green-500/10 text-green-400 border border-green-500/20"
                            : user.status === "pending"
                            ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}>
                          {user.status}
                        </span>
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-wrap gap-2 items-center">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="p-2 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 transition"
                          >
                            <Edit size={15} />
                          </button>

                          <button
                            onClick={() => openDeleteDialog(user.id)}
                            className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition"
                          >
                            <Trash2 size={15} />
                          </button>

                          <button
                            onClick={() => handleToggleStatus(user.id, user.status)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              user.status === "active" ? "bg-orange-500" : "bg-white/20"
                            }`}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                              user.status === "active" ? "translate-x-6" : "translate-x-1"
                            }`} />
                          </button>
                        </div>
                      </TableCell>

                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex justify-center gap-2 flex-wrap">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="px-4 py-2 rounded-lg bg-[#1a1a1a] border border-white/10 text-white/70 hover:border-yellow-500 hover:text-yellow-400 disabled:opacity-30 disabled:cursor-not-allowed transition text-sm"
            >
              Prev
            </button>

            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-4 py-2 rounded-lg border text-sm transition ${
                  currentPage === i + 1
                    ? "bg-yellow-500 border-yellow-500 text-black font-bold"
                    : "bg-[#1a1a1a] border-white/10 text-white/70 hover:border-yellow-500 hover:text-yellow-400"
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-4 py-2 rounded-lg bg-[#1a1a1a] border border-white/10 text-white/70 hover:border-yellow-500 hover:text-yellow-400 disabled:opacity-30 disabled:cursor-not-allowed transition text-sm"
            >
              Next
            </button>
          </div>

        </main>
      </div>

      <AddUserDialog
        open={open}
        onOpenChange={setOpen}
        onUserAdded={fetchUsers}
      />

      <EditUserDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        user={selectedUser}
        onUserUpdated={fetchUsers}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="bg-[#1a1a1a] border border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-yellow-400">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              This action cannot be undone. This will permanently delete the user
              and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
