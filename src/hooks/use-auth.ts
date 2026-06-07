"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";

export type AuthUser = {
  id: string;
  email: string;
  fullName: string | null;
};

type UseAuthReturn = {
  user: AuthUser | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
};

function mapUser(
  supabaseUser: NonNullable<
    Awaited<
      ReturnType<ReturnType<typeof createClient>["auth"]["getUser"]>
    >["data"]["user"]
  >,
): AuthUser {
  const metadata = supabaseUser.user_metadata as Record<string, unknown>;

  return {
    id: supabaseUser.id,
    email: supabaseUser.email ?? "",
    fullName:
      typeof metadata.full_name === "string"
        ? metadata.full_name
        : typeof metadata.name === "string"
          ? metadata.name
          : null,
  };
}

export function useAuth(): UseAuthReturn {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user ? mapUser(data.user) : null);
      setIsLoading(false);
    };

    void loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? mapUser(session.user) : null);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = useCallback(async () => {
    const supabase = createClient();
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Sign out error:", error);
    }
    setUser(null);
    router.push("/login");
    router.refresh();
  }, [router]);

  return {
    user,
    isLoading,
    signOut,
  };
}
