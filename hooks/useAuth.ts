import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface UseAuthOptions {
  requiredRole?: "STUDENT" | "TEACHER";
  redirectTo?: string;
}

export function useAuth({ requiredRole, redirectTo = "/login" }: UseAuthOptions = {}) {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);

  function redirectWithFade(path: string) {
    setFadingOut(true);
    setTimeout(() => router.push(path), 600);
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    redirectWithFade("/");
  }

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedRole = localStorage.getItem("role");

    if (!savedToken) {
      redirectWithFade(redirectTo);
      return;
    }

    if (requiredRole && savedRole !== requiredRole) {
      const fallback = savedRole === "TEACHER" ? "/teacher" : "/dashboard";
      redirectWithFade(fallback);
      return;
    }

    setToken(savedToken);
    setRole(savedRole);
    setIsReady(true);
  }, []);

  return { token, role, isReady, fadingOut, logout, redirectWithFade };
}