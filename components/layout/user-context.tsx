"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface UserContextType {
  user: any;
  setUser: (user: any) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(undefined);

  useEffect(() => {
    fetch("/api/auth/supabase/me")
      .then(res => res.json())
      .then(data => setUser(data.user || null));
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
} 