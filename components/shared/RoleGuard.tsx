//"use client";

//import { useSession } from "@/lib/auth/auth-client";
//import { UserRole } from "@/types";
//import { useRouter } from "next/navigation";
//import { useEffect, type ReactNode } from "react";

//const isMockMode = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

//interface RoleGuardProps {
//  children: ReactNode;
//  allowedRoles: UserRole[];
//  fallbackPath?: string;
//}

//export function RoleGuard({
//  children,
//  allowedRoles,
//  fallbackPath = "/login",
//}: RoleGuardProps) {
//  // In mock mode, skip all auth checks — middleware handles routing
//  if (isMockMode) {
//    return <>{children}</>;
//  }

//  return (
//    <RoleGuardAuth allowedRoles={allowedRoles} fallbackPath={fallbackPath}>
//      {children}
//    </RoleGuardAuth>
//  );
//}

//function RoleGuardAuth({
//  children,
//  allowedRoles,
//  fallbackPath = "/login",
//}: RoleGuardProps) {
//  const { data: session, isPending } = useSession();
//  const router = useRouter();

//  useEffect(() => {
//    if (!isPending && session?.user) {
//      const userRole = (session.user as { role?: string }).role as UserRole;
//      if (!allowedRoles.includes(userRole)) {
//        const roleHomePaths: Record<string, string> = {
//          ADMIN: "/admin",
//          HEAD: "/head",
//          STAFF: "/staff",
//        };
//        router.replace(roleHomePaths[userRole] || fallbackPath);
//      }
//    }
//    if (!isPending && !session?.user) {
//      router.replace(fallbackPath);
//    }
//  }, [session, isPending, allowedRoles, fallbackPath, router]);

//  if (isPending) {
//    return (
//      <div className="flex min-h-screen items-center justify-center">
//        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
//      </div>
//    );
//  }

//  if (!session?.user) {
//    return null;
//  }

//  const userRole = (session.user as { role?: string }).role as UserRole;
//  if (!allowedRoles.includes(userRole)) {
//    return null;
//  }

//  return <>{children}</>;
//}
