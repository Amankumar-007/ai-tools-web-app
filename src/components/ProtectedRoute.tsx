"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const user = await getCurrentUser();
      if (!user) {
        router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      }
    };
    checkAuth();
  }, [router]);

  return <>{children}</>;
}