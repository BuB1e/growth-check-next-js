"use client";

import { ColumnDef } from "@tanstack/react-table";
import { UserResponse } from "@/dto";
import { Role, RoleToThai } from "@/types";

export const columns: ColumnDef<UserResponse>[] = [
  {
    accessorKey: "firstName",
    header: "ชื่อจริง",
  },
  {
    accessorKey: "lastName",
    header: "นามสกุล",
  },
  {
    accessorKey: "role",
    header: "ตำแหน่ง",
    cell: ({ row }) => {
      const role = row.getValue("role") as Role;
      return <div>{RoleToThai[role] ?? role}</div>;
    },
  },
  {
    accessorKey: "updatedAt",
    header: "วันที่แก้ไขล่าสุด",
    cell: ({ row }) => {
      const date = new Date(row.getValue("updatedAt"));
      return <div>{date.toLocaleDateString("th-TH")}</div>;
    },
  },
];
