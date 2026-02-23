import DeveloperSideBar from "@/components/sidebar/DeveloperSideBar/Developer";

export default function DeveloperLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      <DeveloperSideBar />

      <main className="flex-1 p-10 bg-gray-100">
        {children}
      </main>
    </div>
  );
}