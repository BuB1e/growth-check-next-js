"use client";

import { AdminLayout } from "@/components/layouts/AdminLayout";
import { RoleGuard } from "@/components/shared/RoleGuard";
import { UserRole } from "@/types";
import { type ReactNode } from "react";

export default function AdminRouteLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={[UserRole.ADMIN]}>
      <AdminLayout>{children}</AdminLayout>
    </RoleGuard>
  );
}
