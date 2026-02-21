"use client";

import React from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { StatCard } from "@/components/dashboard/StatCard";
import { QuickActionCard } from "@/components/dashboard/QuickActionCard";
import { RecentActivity, Activity } from "@/components/dashboard/RecentActivity";
import { Skeleton } from "@/components/ui/Skeleton";
import { Home, CreditCard, MessageSquare, Plus, Search, ArrowLeft } from "lucide-react";

type DashboardSummary = {
  user: {
    name: string;
  };
  stats: {
    listingsCount: number;
    paymentsCount: number;
    unreadMessages: number;
  };
  recentActivities: Activity[];
};

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) throw new Error("Failed to fetch dashboard data");
  return res.json();
});

export default function DashboardPage() {
  const router = useRouter();
  const { data, error, isLoading } = useSWR<DashboardSummary>(
    "/api/dashboard/summary",
    fetcher
  );

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center">
          <p className="text-red-600 dark:text-red-400">
            Failed to load dashboard data. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-start gap-4">
          {/* Back Button */}
          <button 
            onClick={() => router.back()}
            className="flex-none flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-neutral-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:bg-gray-50 dark:hover:bg-neutral-700 transition-all group"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white" />
          </button>

          {/* Welcome Header */}
          <div className="flex-1">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-96" />
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Welcome back, {data?.user.name} 
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  Here’s what’s happening with your account today.
                </p>
              </>
            )}
          </div>
        </div>

        {/* Stats Cards Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <>
              <Skeleton className="h-32 w-full rounded-xl" />
              <Skeleton className="h-32 w-full rounded-xl" />
              <Skeleton className="h-32 w-full rounded-xl" />
            </>
          ) : (
            <>
              <StatCard
                title="Listings"
                value={data?.stats.listingsCount || 0}
                description="Active properties"
                icon={Home}
                className="bg-blue-100 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
              />
              <StatCard
                title="Payments"
                value={data?.stats.paymentsCount || 0}
                description="Completed transactions"
                icon={CreditCard}
                className="bg-emerald-100 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800"
              />
              <StatCard
                title="Unread Messages"
                value={data?.stats.unreadMessages || 0}
                description="Waiting for response"
                icon={MessageSquare}
                className="bg-purple-100 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800"
              />
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
             <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Actions
             </h2>
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 h-auto">
                <QuickActionCard 
                  title="Create Listing"
                  description="Add a new property"
                  href="/dashboard/listings/create"
                  icon={Plus}
                />
                <QuickActionCard 
                  title="Browse Listings"
                  description="Find places to stay"
                  href="/browse"
                  icon={Search}
                />
                <QuickActionCard 
                  title="Messages"
                  description="Check your inbox"
                  href="/dashboard/messages"
                  icon={MessageSquare}
                />
             </div>
          </div>
          
          <div className="lg:col-span-1">
             {isLoading ? (
                <Skeleton className="h-96 w-full rounded-xl" />
             ) : (
                <RecentActivity activities={data?.recentActivities || []} />
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
