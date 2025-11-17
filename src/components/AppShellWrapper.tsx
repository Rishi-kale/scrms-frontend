"use client";

import { Suspense } from "react";
import AppShell from "./AppShell";

export default function AppShellWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div suppressHydrationWarning>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      }>
        <AppShell>{children}</AppShell>
      </Suspense>
    </div>
  );
}
