"use client";

import { MainApplication } from "@/components/MainApplication";
import { AuthProvider, useAuthContext } from "@/store/AuthContext";
import { AuthScreen } from "@/components/auth/AuthScreen";

const AuthGuard = () => {
  const { user, isLoading } = useAuthContext();

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "var(--color-dark-blue)", color: "white" }}>
        Loading...
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return <MainApplication />;
};

export default function Home() {
  return (
    <AuthProvider>
      <AuthGuard />
    </AuthProvider>
  );
}
