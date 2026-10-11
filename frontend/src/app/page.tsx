"use client";

import React, { useState, useEffect } from "react";
import { LandingView } from "@/components/LandingView";
import { MainApplication } from "@/components/MainApplication";

export default function Home() {
  const [view, setView] = useState<"landing" | "toolbox">("landing");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const checkView = () => {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const toolParam = params.get("tool");
        const viewParam = params.get("view");
        const appParam = params.get("app");
        const pathname = window.location.pathname.toLowerCase();

        if (pathname.includes("toolbox") || toolParam || viewParam === "toolbox" || appParam === "true") {
          if (pathname === "/" && (viewParam === "toolbox" || toolParam)) {
            window.history.replaceState({}, "", toolParam ? `/Neepank-toolbox?tool=${toolParam}` : "/Neepank-toolbox");
          }
          setView("toolbox");
        } else {
          setView("landing");
        }
      }
    };

    checkView();
    window.addEventListener("popstate", checkView);
    return () => window.removeEventListener("popstate", checkView);
  }, []);

  const handleOpenTool = (toolId?: string) => {
    if (typeof window !== "undefined") {
      const targetUrl = toolId ? `/Neepank-toolbox?tool=${toolId}` : "/Neepank-toolbox";
      window.history.pushState({}, "", targetUrl);
    }
    setView("toolbox");
  };

  const handleBackToHome = () => {
    if (typeof window !== "undefined") {
      window.history.pushState({}, "", "/");
    }
    setView("landing");
  };

  if (!isClient) {
    // Initial server-side or static hydration render: render LandingView
    return <LandingView onOpenTool={handleOpenTool} />;
  }

  if (view === "toolbox") {
    return <MainApplication onBackToHome={handleBackToHome} />;
  }

  return <LandingView onOpenTool={handleOpenTool} />;
}
