"use client";
import React from "react";
import Table from "../../components/Table";

const columns = [
  { id: "id", header: "ID", accessor: "id", sortable: true, width: 80 },
  { id: "name", header: "Name", accessor: "name", sortable: true },
  { id: "email", header: "Email", accessor: "email", sortable: true },
  { id: "role", header: "Role", accessor: "role", sortable: true },
];

const data = Array.from({ length: 35 }).map((_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  role: i % 3 === 0 ? "Admin" : "Member",
}));

export default function Page() {
  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-semibold">Demo: Data Table</h1>
      <Table columns={columns} data={data} pageSize={10} rowKey="id" />
    </div>
  );
}
