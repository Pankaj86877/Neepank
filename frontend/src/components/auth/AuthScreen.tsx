"use client";

import React, { useState } from "react";
import { useAuthContext } from "@/store/AuthContext";

export const AuthScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { checkAuth, login } = useAuthContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (email.trim().toLowerCase() === "admin@neepank.com" && password === "admin") {
      localStorage.setItem("dummy_user", "true");
      login({ id: "dummy", email: "admin@neepank.com" });
      setLoading(false);
      return;
    }

    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";

    try {
      const res = await fetch(`http://localhost:4000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      if (!res.ok) {
        // If the backend isn't running, gracefully suggest the dummy login
        throw new Error("Backend not connected. Use admin@neepank.com / admin to bypass.");
      }

      await checkAuth();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "var(--color-dark-blue)", color: "white", fontFamily: "Inter, sans-serif" }}>
      <div style={{ background: "rgba(255,255,255,0.05)", padding: "40px", borderRadius: "16px", width: "100%", maxWidth: "400px", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 20px 40px rgba(0,0,0,0.4)" }}>
        <h2 style={{ textAlign: "center", marginBottom: "24px", fontSize: "24px", fontWeight: 700 }}>
          {isLogin ? "Welcome Back" : "Create Account"}
        </h2>
        
        {error && <div style={{ background: "rgba(249,92,21,0.1)", color: "var(--color-orange)", padding: "12px", borderRadius: "8px", marginBottom: "20px", fontSize: "14px", border: "1px solid rgba(249,92,21,0.3)" }}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "12px", color: "rgba(255,255,255,0.6)" }}>Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
              style={{ width: "100%", padding: "12px", borderRadius: "8px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", color: "white", outline: "none" }} 
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "12px", color: "rgba(255,255,255,0.6)" }}>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              style={{ width: "100%", padding: "12px", borderRadius: "8px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", color: "white", outline: "none" }} 
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            style={{ width: "100%", padding: "14px", borderRadius: "8px", background: "var(--color-purple)", color: "white", border: "none", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", marginTop: "8px", opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Please wait..." : isLogin ? "Sign In" : "Sign Up"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "24px", fontSize: "14px", color: "rgba(255,255,255,0.6)" }}>
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button 
            onClick={() => { setIsLogin(!isLogin); setError(""); }} 
            style={{ background: "none", border: "none", color: "var(--color-light-blue)", cursor: "pointer", fontWeight: 600 }}
          >
            {isLogin ? "Sign Up" : "Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
};
