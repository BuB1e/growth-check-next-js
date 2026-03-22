import { redirect } from "next/navigation";

/**
 * Fallback for any non-existent page.
 * Redirects to the home page, which will then handle device-based redirection or login.
 */
export default function NotFound() {
  redirect("/");
}
