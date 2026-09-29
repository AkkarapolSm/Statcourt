"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/auth/useAuthStore";

export default function SessionBootstrap() {
  const refreshSession = useAuthStore((state) => state.refreshSession);
  useEffect(() => { void refreshSession(); }, [refreshSession]);
  return null;
}
