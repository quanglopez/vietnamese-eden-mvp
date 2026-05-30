"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export function SignOutButton() {
  const { signOut, isLoading } = useAuth();

  return (
    <Button
      variant="outline"
      disabled={isLoading}
      onClick={() => void signOut()}
    >
      Đăng xuất
    </Button>
  );
}
