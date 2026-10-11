"use client";

import React, { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

export const WorkspaceLayout = ({ children, onBackToHome }: { children: ReactNode; onBackToHome?: () => void }) => {
  return (
    <div className="app-shell">
      <Sidebar onBackToHome={onBackToHome} />
      <main>
        <TopBar onBackToHome={onBackToHome} />
        <div className="views">
          {children}
        </div>
      </main>
    </div>
  );
};

