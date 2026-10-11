"use client";

import { MainApplication } from "@/components/MainApplication";

export default function NeepankToolboxPage() {
  return (
    <MainApplication 
      onBackToHome={() => {
        if (typeof window !== "undefined") {
          window.location.href = "/";
        }
      }} 
    />
  );
}
