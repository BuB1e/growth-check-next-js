"use client";

import { StaffLayout } from "@/components/layouts/StaffLayout";
import { RoleGuard } from "@/components/shared/RoleGuard";
import { UserRole } from "@/types";
import { type ReactNode } from "react";

export default function StaffRouteLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={[UserRole.STAFF]}>
      <StaffLayout>{children}</StaffLayout>
    </RoleGuard>
  );
}
