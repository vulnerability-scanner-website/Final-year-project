import AnalystSideBar from "@/components/sidebar/AnalystSideBar/Analyst.jsx";

export default function AnalystLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      <AnalystSideBar />

      <main className="flex-1 bg-[#101010] min-h-screen overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}