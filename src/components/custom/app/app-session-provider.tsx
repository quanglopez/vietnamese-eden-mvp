"use client";

import { createContext, useContext, type ReactNode } from "react";

export type AppSessionUser = {
  email: string | undefined;
  fullName: string | null;
};

const AppSessionContext = createContext<AppSessionUser | null>(null);

export function AppSessionProvider({
  user,
  children,
}: {
  user: AppSessionUser;
  children: ReactNode;
}) {
  return (
    <AppSessionContext.Provider value={user}>{children}</AppSessionContext.Provider>
  );
}

export function useAppSession() {
  const context = useContext(AppSessionContext);
  if (!context) {
    throw new Error("useAppSession must be used within AppSessionProvider");
  }
  return context;
}
