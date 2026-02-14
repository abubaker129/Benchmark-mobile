import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../integrations/supabase/client";
import { removeToken, saveToken } from "../utils/token";

const AuthContext = createContext();

async function fetchProfile(userId) {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (error) {
    return null;
  }
  return data || null;
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkSubscription = useCallback(async () => {
    if (!session?.access_token) return;
    try {
      await supabase.functions.invoke("check-subscription", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
    } catch {
      // Keep silent for user app flow if billing data is not provisioned yet.
    }
  }, [session?.access_token]);

  useEffect(() => {
    const init = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        await removeToken();
        setSession(null);
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      const currentSession = data?.session ?? null;
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.access_token) {
        await saveToken(currentSession.access_token);
      } else {
        await removeToken();
      }

      if (currentSession?.user?.id) {
        const profileData = await fetchProfile(currentSession.user.id);
        setProfile(profileData);
      } else {
        setProfile(null);
      }

      setLoading(false);
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession ?? null);
      setUser(nextSession?.user ?? null);

      if (nextSession?.access_token) {
        saveToken(nextSession.access_token).catch(() => {});
      } else {
        removeToken().catch(() => {});
      }

      if (nextSession?.user?.id) {
        fetchProfile(nextSession.user.id)
          .then((profileData) => setProfile(profileData))
          .catch(() => setProfile(null));
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data?.session?.access_token) {
      setSession(data.session);
      setUser(data.session.user ?? null);
      await saveToken(data.session.access_token);

      const profileData = await fetchProfile(data.session.user.id);
      setProfile(profileData);
    }
    return data;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    await removeToken();
    setSession(null);
    setUser(null);
    setProfile(null);
  };

  const value = useMemo(
    () => ({
      user,
      session,
      profile,
      portalId: profile?.portal_id ?? null,
      isAuthenticated: !!session,
      loading,
      checkSubscription,
      login,
      logout,
    }),
    [user, session, profile, loading, checkSubscription]
  );

  useEffect(() => {
    if (!session?.access_token) return;
    checkSubscription();

    const interval = setInterval(() => {
      checkSubscription();
    }, 60000);

    return () => clearInterval(interval);
  }, [session?.access_token, checkSubscription]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
