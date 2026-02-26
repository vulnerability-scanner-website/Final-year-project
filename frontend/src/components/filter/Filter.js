"use client";

export default function Filter({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
}) {
  return (
    <div className="flex gap-4 mb-6">
      
      <input
        type="text"
        placeholder="Search by name or email..."
        className="border px-4 py-2 rounded w-64"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

     
      <select
        className="border px-4 py-2 rounded pr-4"
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
      >
        <option value="">All Status</option>
        <option value="Approved">Approved</option>
        <option value="Pending">Pending</option>
        <option value="Rejected">Rejected</option>
      </select>
    </div>
  );
}