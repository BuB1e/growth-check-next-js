import { redirect } from "next/navigation";

export default function Home() {
  // Authentication and role-based redirection are handled in proxy.ts.
  // This page is a fallback that redirects unauthenticated users to /login.
  redirect("/login");
}
