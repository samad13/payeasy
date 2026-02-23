import "../lib/env";
import type { Metadata } from "next";
import { ThemeProvider } from "@/lib/theme/provider";
import { ServiceWorkerProvider } from "@/components/providers/ServiceWorkerProvider";
import NextTopLoader from 'nextjs-toploader';
import WalletProvider from "@/providers/WalletProvider";
import AuthProvider from "@/providers/AuthProvider";
import FavoritesProvider from "@/components/FavoritesProvider";
import ComparisonProvider from "@/components/ComparisonProvider";
import ComparisonBar from "@/components/ComparisonBar";
import { Toaster } from 'react-hot-toast';
import "./globals.css";
import "@fontsource-variable/inter";

export const metadata: Metadata = {
  title: "PayEasy | Shared Rent on Stellar",
  description: "Secure, blockchain-powered rent sharing.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-white text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-white font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextTopLoader color="#7D00FF" showSpinner={false} />
          <ServiceWorkerProvider>
            <WalletProvider>
              <AuthProvider>
                <FavoritesProvider>
                  <ComparisonProvider>
                    {children}
                    <ComparisonBar />
                  </ComparisonProvider>
                </FavoritesProvider>
              </AuthProvider>
            </WalletProvider>
          </ServiceWorkerProvider>
          <Toaster position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
