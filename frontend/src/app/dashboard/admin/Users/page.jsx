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
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const API_URL = "http://localhost:5000/api/admin/users";

  // --- API Integrations ---

  const fetchUsers = async () => {
    try {
      const res = await fetch(API_URL, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setUsers([]);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async (newUser) => {
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newUser),
      });
      if (res.ok) {
        fetchUsers();
        setOpen(false);
      }
    } catch (err) { console.error(err); }
  };

  const handleUpdateUser = async (updatedUser) => {
    try {
      const res = await fetch(`${API_URL}/${updatedUser.id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updatedUser),
      });
      if (res.ok) {
        fetchUsers();
        setEditOpen(false);
      }
    } catch (err) { console.error(err); }
  };

  const handleToggleStatus = async (userId) => {
    const user = users.find((u) => u.id === userId);
    const updatedStatus = user.status === "active" ? "inactive" : "active";
    
    try {
      const res = await fetch(`${API_URL}/${userId}/status`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: updatedStatus }),
      });
      if (res.ok) {
        fetchUsers();
      }
    } catch (err) { console.error(err); }
  };

  const confirmDelete = async () => {
    try {
      const res = await fetch(`${API_URL}/${selectedUser.id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (res.ok) {
        fetchUsers();
        setDeleteOpen(false);
      }
    } catch (err) { console.error(err); }
  };

  // --- UI Logic ---

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "" || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const usersPerPage = 5;
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handleEdit = (user) => {
    setSelectedUser(user);
    setEditOpen(true);
  };

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setDeleteOpen(true);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSideBar />
      <div className="flex-1 ml-64">
        <DashboardHeader role="usermanagement" onActionClick={() => setOpen(true)} />

        <AddUserDialog open={open} setOpen={setOpen} onAddUser={handleAddUser} />
        {selectedUser && (
          <EditUserDialog open={editOpen} setOpen={setEditOpen} user={selectedUser} onUpdate={handleUpdateUser} />
        )}

        <main className="my-6 ">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="border-yellow-400 border">
              <CardContent className="p-5 flex justify-between items-center">
                <div><p className="text-sm text-gray-500">Total Users</p><p className="text-3xl font-bold">{users.length}</p></div>
                <Users className="w-6 h-6 text-[#003366]" />
              </CardContent>
            </Card>
            <Card className="border-yellow-400 border">
              <CardContent className="p-6 flex justify-between items-center">
                <div><p className="text-sm text-gray-500">Active Users</p><p className="text-3xl font-bold">{users.filter(u => u.status === "active").length}</p></div>
                <UserCheck className="w-6 h-6 text-green-600" />
              </CardContent>
            </Card>
            <Card className="border-yellow-400 border">
              <CardContent className="p-6 flex justify-between items-center">
                <div><p className="text-sm text-gray-500">Inactive Users</p><p className="text-3xl font-bold">{users.filter(u => u.status === "inactive").length}</p></div>
                <Scan className="w-6 h-6 text-purple-600" />
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-md mb-6">
            <CardContent className="flex flex-col md:flex-row gap-3 p-2">
              <input 
                type="text" placeholder="Search by name..." className="w-full border p-2 rounded-md outline-none" 
                value={search} onChange={(e) => setSearch(e.target.value)} 
              />
              <select 
                className="w-full md:w-64 border p-2 rounded-md outline-none bg-white" 
                value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
              </select>
            </CardContent>
          </Card>

          <Card className="shadow-md overflow-hidden px-8">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>UserId</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentUsers.map((user, index) => (
                  <TableRow key={user.id}>
                    <TableCell>{(indexOfFirstUser + index + 1).toString().padStart(2, "0")}</TableCell>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>
                      <span className={`px-4 py-1 rounded-full text-xs font-medium ${
                        user.status === "active" ? "bg-green-100 text-green-800" : 
                        user.status === "pending" ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-800"
                      }`}>{user.status}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(user)}>
                          <Edit className="w-4 h-4 text-[#003366]" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(user)}>
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                        <Switch 
                          checked={user.status === "active"} 
                          onCheckedChange={() => handleToggleStatus(user.id)}
                          disabled={user.status === "pending"}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          <div className="flex justify-center items-center mt-4">
            <div className="flex gap-2">
              <Button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Prev</Button>
              {Array.from({ length: totalPages }, (_, i) => (
                <Button key={i} variant={currentPage === i + 1 ? "default" : "outline"} onClick={() => setCurrentPage(i + 1)}>{i + 1}</Button>
              ))}
              <Button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next</Button>
            </div>
          </div>

          <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>Delete <span className="font-bold text-red-600">{selectedUser?.email}</span>?</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDelete} className="bg-red-600">Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </main>
      </div>
    </div>
  );
}