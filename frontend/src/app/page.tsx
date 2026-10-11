"use client";

import React, { useState, useEffect } from "react";
import { LandingView } from "@/components/LandingView";
import { MainApplication } from "@/components/MainApplication";

export default function Home() {
  const [view, setView] = useState<"landing" | "toolbox">("landing");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Check if the URL has ?tool=... or ?view=toolbox or ?app=true
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const toolParam = params.get("tool");
      const viewParam = params.get("view");
      const appParam = params.get("app");

      if (toolParam || viewParam === "toolbox" || appParam === "true") {
        setView("toolbox");
      }
    }
  }, []);

  const handleOpenTool = (toolId?: string) => {
    if (typeof window !== "undefined") {
      if (toolId) {
        window.history.pushState({}, "", `/?tool=${toolId}`);
      } else {
        window.history.pushState({}, "", "/?view=toolbox");
      }
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
