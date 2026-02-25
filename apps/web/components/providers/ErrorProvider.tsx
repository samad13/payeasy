"use client";

import { useEffect, ReactNode } from "react";
import { initGlobalErrorCapture } from "@/lib/error-capture";
import ErrorBoundary from "@/components/ErrorBoundary";

export function ErrorProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    initGlobalErrorCapture();
  }, []);

  return <ErrorBoundary>{children}</ErrorBoundary>;
}
