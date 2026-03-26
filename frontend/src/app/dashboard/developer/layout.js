export default function DeveloperLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}