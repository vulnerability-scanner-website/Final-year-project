"use client";

export default function Filter({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
}) {
  return (
    <div className="flex gap-4 mb-6">
      {/* Search */}
      <input
        type="text"
        placeholder="Search by name or email..."
        className="border px-4 py-2 rounded w-64"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Status Filter */}
      <select
        className="border px-4 py-2 rounded"
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