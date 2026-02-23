import "../lib/env";
import type { Metadata } from "next";
import { ServiceWorkerProvider } from "@/components/providers/ServiceWorkerProvider";
import NextTopLoader from 'nextjs-toploader';
import WalletProvider from "@/providers/WalletProvider";
import AuthProvider from "@/providers/AuthProvider";
import FavoritesProvider from "@/components/FavoritesProvider";
import ComparisonProvider from "@/components/ComparisonProvider";
import ComparisonBar from "@/components/ComparisonBar";
import "./globals.css";
import "@fontsource-variable/inter";

export const metadata: Metadata = {
  title: "PayEasy | Shared Rent on Stellar",
  description: "Secure, blockchain-powered rent sharing.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-white font-sans">
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
      </body>
    </html>
  );
}