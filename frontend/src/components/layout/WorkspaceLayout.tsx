"use client";

import React, { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

export const WorkspaceLayout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <Sidebar />
      <main>
        <TopBar />
        <div className="views">
          {children}
        </div>
      </main>
    </>
  );
};

