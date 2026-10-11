"use client";

import { MainApplication } from "@/components/MainApplication";

export default function ToolboxPage() {
  return <MainApplication onBackToHome={() => { window.location.href = "/"; }} />;
}
