"use client";

import { useCallback, useState } from "react";

type AuthUser = {
  id: string;
  email: string;
};

type UseAuthReturn = {
  user: AuthUser | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

export function useAuth(): UseAuthReturn {
  const [user] = useState<AuthUser | null>(null);
  const [isLoading] = useState(false);

  const signIn = useCallback(async (email: string, password: string) => {
    void email;
    void password;
    // Placeholder — sẽ kết nối Supabase Auth ở ALE-64
    await Promise.resolve();
  }, []);

  const signOut = useCallback(async () => {
    // Placeholder — sẽ kết nối Supabase Auth ở ALE-64
    await Promise.resolve();
  }, []);

  return {
    user,
    isLoading,
    signIn,
    signOut,
  };
}
