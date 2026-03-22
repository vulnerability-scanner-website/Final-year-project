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
import { Switch } from "@/components/ui/switch";
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
    <div className="min-h-screen bg-gray-100">
      <div className="w-full">
        <DashboardHeader
          role="usermanagement"
          onActionClick={() => setOpen(true)}
        />

        <main className="space-y-6">

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

            <Card>
              <CardContent className="flex justify-between items-center p-5">
                <div>
                  <p className="text-sm text-gray-500">Total Users</p>
                  <p className="text-2xl font-bold">{users.length}</p>
                </div>
                <Users className="text-[#003366]" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex justify-between items-center p-5">
                <div>
                  <p className="text-sm text-gray-500">Active Users</p>
                  <p className="text-2xl font-bold">
                    {users.filter((u) => u.status === "active").length}
                  </p>
                </div>
                <UserCheck className="text-green-600" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex justify-between items-center p-5">
                <div>
                  <p className="text-sm text-gray-500">Inactive Users</p>
                  <p className="text-2xl font-bold">
                    {users.filter((u) => u.status === "inactive").length}
                  </p>
                </div>
                <Scan className="text-purple-600" />
              </CardContent>
            </Card>

          </div>

          {/* Search */}
          <Card>
            <CardContent className="flex flex-col md:flex-row gap-3 p-4">
              <input
                type="text"
                placeholder="Search by email..."
                className="border p-2 rounded w-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <select
                className="border p-2 rounded md:w-64"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
              </select>
            </CardContent>
          </Card>

          {/* Table */}
          <Card>
            <div className="w-full overflow-x-auto">
              <Table>

                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {currentUsers.map((user, index) => (

                    <TableRow key={user.id}>

                      <TableCell>
                        {(indexOfFirstUser + index + 1)
                          .toString()
                          .padStart(2, "0")}
                      </TableCell>

                      <TableCell className="break-all">
                        {user.email}
                      </TableCell>

                      <TableCell>{user.role}</TableCell>

                      <TableCell>
                        <span className={`px-3 py-1 rounded-full text-xs ${
                          user.status === "active" 
                            ? "bg-green-100 text-green-700" 
                            : "bg-red-100 text-red-700"
                        }`}>
                          {user.status}
                        </span>
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit size={16} />
                          </Button>

                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => openDeleteDialog(user.id)}
                          >
                            <Trash2 size={16} className="text-red-600" />
                          </Button>

                          <Switch 
                            checked={user.status === "active"}
                            onCheckedChange={() => handleToggleStatus(user.id, user.status)}
                          />
                        </div>
                      </TableCell>

                    </TableRow>

                  ))}
                </TableBody>

              </Table>
            </div>
          </Card>

          {/* Pagination */}
          <div className="flex justify-center gap-2 flex-wrap">
            <Button
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Prev
            </Button>

            {Array.from({ length: totalPages }, (_, i) => (
              <Button
                size="sm"
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                variant={currentPage === i + 1 ? "default" : "outline"}
              >
                {i + 1}
              </Button>
            ))}

            <Button
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
            </Button>
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user
              and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteUser}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
