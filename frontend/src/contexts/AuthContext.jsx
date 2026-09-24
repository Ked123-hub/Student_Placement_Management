import { useEffect, useMemo, useState } from "react";
import { authService } from "../services/authService";
import { AUTH_SESSION_EXPIRED_EVENT, getAccessToken } from "../services/api";
import { AuthContext } from "./authContext";
import { useToast } from "./useToast";

export function AuthProvider({ children }) {
  const { show } = useToast();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(Boolean(getAccessToken()));

  useEffect(() => {
    let isMounted = true;

    const handleSessionExpired = () => {
      if (isMounted) setUser(null);
      show({
        type: "error",
        message: "Your session expired. Please sign in again.",
      });
    };

    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, handleSessionExpired);

    async function restoreSession() {
      if (!getAccessToken()) {
        setIsLoading(false);
        return;
      }

      try {
        const currentUser = await authService.me();
        if (isMounted) setUser(currentUser);
      } catch {
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    restoreSession();

    return () => {
      isMounted = false;
      window.removeEventListener(
        AUTH_SESSION_EXPIRED_EVENT,
        handleSessionExpired,
      );
    };
  }, [show]);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      async login(credentials) {
        const data = await authService.login(credentials);
        setUser(data.user);
        return data;
      },
      async logout() {
        await authService.logout();
        setUser(null);
      },
      async changePassword(payload) {
        await authService.changePassword(payload);
        setUser((current) =>
          current ? { ...current, mustChangePassword: false } : current,
        );
      },
    }),
    [isLoading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
