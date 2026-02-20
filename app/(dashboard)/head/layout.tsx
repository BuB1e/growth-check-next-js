"use client";

import { HeadLayout } from "@/components/layouts/HeadLayout";
import { RoleGuard } from "@/components/shared/RoleGuard";
import { UserRole } from "@/types";
import { type ReactNode } from "react";

export default function HeadRouteLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard allowedRoles={[UserRole.HEAD]}>
      <HeadLayout>{children}</HeadLayout>
    </RoleGuard>
  );
}
