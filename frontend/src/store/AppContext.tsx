"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

type AppState = {
  activeSection: string;
  setActiveSection: (section: string) => void;
  openTabs: string[];
  setOpenTabs: (tabs: string[]) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  theme: string;
  setTheme: (theme: string) => void;
  isSidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  isMobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  recentTools: string[];
  setRecentTools: (tools: string[]) => void;
  myTools: string[];
  setMyTools: (tools: string[]) => void;
};

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [activeSection, setActiveSection] = useState("home");
  const [openTabs, setOpenTabs] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [theme, setTheme] = useState("dark");
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [recentTools, setRecentTools] = useState<string[]>([]);
  const [myTools, setMyTools] = useState<string[]>([]);

  useEffect(() => {
    const savedRecent = localStorage.getItem("neepank_recent_tools");
    if (savedRecent) {
      try { setRecentTools(JSON.parse(savedRecent)); } catch (e) {}
    }
    const savedMyTools = localStorage.getItem("neepank_my_tools");
    if (savedMyTools) {
      try { setMyTools(JSON.parse(savedMyTools)); } catch (e) {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("neepank_recent_tools", JSON.stringify(recentTools));
  }, [recentTools]);

  useEffect(() => {
    localStorage.setItem("neepank_my_tools", JSON.stringify(myTools));
  }, [myTools]);

  const handleSetActiveSection = (section: string) => {
    setActiveSection(section);
    if (section !== "home" && section !== "settings") {
      setRecentTools(prev => {
        const filtered = prev.filter(t => t !== section);
        return [section, ...filtered].slice(0, 6);
      });
    }
  };

  useEffect(() => {
    const isLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (isLight) setTheme("light");
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <AppContext.Provider
      value={{
        activeSection,
        setActiveSection: handleSetActiveSection,
        openTabs,
        setOpenTabs,
        searchQuery,
        setSearchQuery,
        activeCategory,
        setActiveCategory,
        theme,
        setTheme,
        isSidebarCollapsed,
        setSidebarCollapsed,
        isMobileMenuOpen,
        setMobileMenuOpen,
        recentTools,
        setRecentTools,
        myTools,
        setMyTools,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};

