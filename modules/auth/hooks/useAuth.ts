"use client";

import { useState, useEffect } from "react";
import { authService } from "@/modules/auth/services/authService";

interface UseAuthOptions {
  requireAuth?: boolean;
  requireOwner?: boolean;
  redirectTo?: string;
}

// Hook untuk mengelola sesi pengguna, status autentikasi, dan hak akses
export function useAuth(options: UseAuthOptions = {}) {
  const { requireAuth = false, requireOwner = false, redirectTo = "/" } = options;
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function checkSession() {
      try {
        const currentUser = await authService.getCurrentUser();
        if (!isMounted) return;

        if (requireAuth && !currentUser) {
          window.location.replace(redirectTo);
          return;
        }

        if (requireOwner && (!currentUser || !currentUser.isOwner)) {
          window.location.replace("/?error=forbidden");
          return;
        }

        setUser(currentUser);
      } catch (err) {
        console.error("Gagal memeriksa sesi login:", err);
        if (requireAuth) window.location.replace(redirectTo);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    checkSession();

    return () => {
      isMounted = false;
    };
  }, [requireAuth, requireOwner, redirectTo]);

  // Fungsi keluar akun terintegrasi
  const logout = async () => {
    await authService.signOut();
    window.location.href = "/";
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isOwner: !!user?.isOwner,
    logout,
  };
}
