import "../lib/env";
import type { Metadata } from "next";
import { Inter } from "@fontsource-variable/inter";
import { ThemeProvider } from "@/lib/theme/provider";
import { ServiceWorkerProvider } from "@/components/providers/ServiceWorkerProvider";
import { ErrorProvider } from "@/components/providers/ErrorProvider";
import NextTopLoader from "nextjs-toploader";
import WalletProvider from "@/providers/WalletProvider";
import AuthProvider from "@/providers/AuthProvider";
import FavoritesProvider from "@/components/FavoritesProvider";
import ComparisonProvider from "@/components/ComparisonProvider";
import dynamic from "next/dynamic";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import { Toaster } from "react-hot-toast";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import NotificationProvider from "@/providers/NotificationProvider";
import { NotificationCenter } from "@/components/NotificationCenter";
import "./globals.css";
import "@fontsource-variable/inter";

// Dynamically import ComparisonBar to reduce initial bundle size
const DynamicComparisonBar = dynamic(() => import("@/components/ComparisonBar"), {
  ssr: false,
  loading: () => null, // Don't show anything while loading
});

export const metadata: Metadata = {
  title: "PayEasy | Shared Rent on Stellar",
  description: "Secure, blockchain-powered rent sharing.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-white font-sans text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-white">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Global error boundary - wraps everything inside ThemeProvider */}
          <ErrorProvider>
            {/* Loading bar at the top */}
            <NextTopLoader color="#7D00FF" showSpinner={false} />

            {/* Analytics tracking */}
            <AnalyticsTracker />

            {/* Core providers */}
            <ServiceWorkerProvider>
              <WalletProvider>
                <AuthProvider>
                  <FavoritesProvider>
                    <ComparisonProvider>
                      {/* Header - visible on all pages */}
                      <Header sticky isAuthenticated userName="User" />

                      {/* Sidebar - app-wide navigation */}
                      <Sidebar />

                      <NotificationProvider>
                        {/* Main content - full width; sidebar overlays content on desktop */}
                        <main className="min-h-screen w-full">
                          {children}
                          <DynamicComparisonBar />
                        </main>
                        <NotificationCenter />
                      </NotificationProvider>
                    </ComparisonProvider>
                  </FavoritesProvider>
                </AuthProvider>
              </WalletProvider>
            </ServiceWorkerProvider>

            {/* Toast notifications with theme-aware styling */}
            <Toaster
              position="bottom-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: "hsl(var(--background))",
                  color: "hsl(var(--foreground))",
                  border: "1px solid hsl(var(--border))",
                },
                success: {
                  style: {
                    background: "hsl(var(--success))",
                    color: "hsl(var(--success-foreground))",
                  },
                },
                error: {
                  style: {
                    background: "hsl(var(--destructive))",
                    color: "hsl(var(--destructive-foreground))",
                  },
                },
              }}
            />
          </ErrorProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
