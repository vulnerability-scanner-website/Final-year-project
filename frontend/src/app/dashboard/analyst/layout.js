import AnalystSideBar from "@/components/sidebar/AnalystSideBar/Analyst.jsx";

export default function AnalystLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      <AnalystSideBar />

      <main className="flex-1 p-10 bg-gray-100">
        {children}
      </main>
    </div>
  );
}