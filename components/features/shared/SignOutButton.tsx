"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { authClient } from "@/lib/auth/auth-client";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface SignOutButtonProps {
  className?: string;
  variant?: "outline" | "destructive" | "ghost" | "default";
  children?: React.ReactNode;
}

export function SignOutButton({ className, variant = "outline", children }: SignOutButtonProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
        },
      },
    });
  };

  return (
    <Button
      variant={variant}
      onClick={handleSignOut}
      className={cn(
        "transition-all active:scale-[0.98]",
        variant === "outline" && "border-2 border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200 rounded-2xl",
        variant === "destructive" && "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20 rounded-2xl",
        className
      )}
    >
      {children || (
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-xl flex items-center justify-center",
            variant === "outline" ? "bg-red-50" : "bg-white/20"
          )}>
            <LogOut className="w-5 h-5" />
          </div>
          <span className="font-bold">ออกจากระบบ</span>
        </div>
      )}
    </Button>
  );
}
