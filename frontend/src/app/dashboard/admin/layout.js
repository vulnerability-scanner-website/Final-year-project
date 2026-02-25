import AdminSideBar from "../../../components/sidebar/AdminSideBar/Admin";

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      <AdminSideBar />

      <main className="flex-1 p-10 bg-gray-100">
        {children}
      </main>
    </div>
  );
}