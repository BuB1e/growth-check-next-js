import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getInternalSession } from "@/lib/auth/auth-guard";

export default async function Home() {
  // Fallback: If no auth session, redirect to login
  const session = await getInternalSession();
  if (!session || !session.user) {
    redirect("/login");
  }

  const role = session.user.role as string;
  const isDesktopRole = role === "ADMIN" || role === "HEAD";

  if (isDesktopRole) {
    redirect("/desktop/dashboard");
  } else {
    redirect("/mobile/staff/home");
  }
}
