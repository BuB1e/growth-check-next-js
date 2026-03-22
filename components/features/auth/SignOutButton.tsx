"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/auth-client";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await authClient.signOut();
      // Force a full page reload and redirect to login to clear all states
      window.location.href = "/login";
    } catch (error) {
      console.error("Sign out failed:", error);
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleSignOut}
      disabled={isLoading}
      variant="outline" 
      className="h-12 rounded-xl text-lg border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all outline-none"
    >
      <LogOut className="mr-2 h-5 w-5" />
      {isLoading ? "กำลังออกจากระบบ..." : "ออกจากระบบ"}
    </Button>
  );
}
