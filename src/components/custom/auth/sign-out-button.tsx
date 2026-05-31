"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

export function SignOutButton({ className }: { className?: string }) {
  const { signOut, isLoading } = useAuth();

  return (
    <Button
      variant="outline"
      disabled={isLoading}
      onClick={() => void signOut()}
      className={cn("w-full", className)}
    >
      Đăng xuất
    </Button>
  );
}
