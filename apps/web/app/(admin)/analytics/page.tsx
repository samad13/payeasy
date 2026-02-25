"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Users, Home, CreditCard, TrendingUp, AlertTriangle,
  Download, RefreshCw, Activity, ArrowUpRight, ArrowDownRight,
  Bell, CheckCircle, XCircle, Clock, Zap,
} from "lucide-react";
import { AnalyticsChart } from "@/components/AnalyticsChart";

type TimeRange = "7d" | "30d" | "90d";

interface MetricCard {
  label: string; value: string | number; change: number;
  icon: React.ElementType; color: string;
}

interface Alert {
  id: string; severity: "critical" | "warning" | "info";
  title: string; description: string; timestamp: string; resolved: boolean;
}

interface AnalyticsData {
  userGrowth: { date: string; users: number; active: number }[];
  listingVolume: { date: string; listings: number; approved: number }[];
  transactionVolume: { date: string; amount: number; count: number }[];
  errorRates: { date: string; errors: number; warnings: number }[];
  engagement: { date: string; sessions: number; pageviews: number }[];
  alerts: Alert[];
  summary: {
    totalUsers: number; userChange: number; activeListings: number;
    listingChange: number; totalRevenue: number; revenueChange: number;
    errorRate: number; errorChange: number; avgSession: number; sessionChange: number;
  };
}

function generateDates(days: number): string[] {
  return Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  });
}

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateData(range: TimeRange): AnalyticsData {
  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
  const dates = generateDates(days);
  let userBase = 1100, listingBase = 300, amountBase = 8000, sessionBase = 2400;

  return {
    userGrowth: dates.map((date) => {
      userBase += rand(5, 25);
      return { date, users: userBase, active: Math.floor(userBase * 0.65 + rand(-20, 20)) };
    }),
    listingVolume: dates.map((date) => {
      listingBase += rand(-2, 8);
      return { date, listings: listingBase, approved: Math.floor(listingBase * 0.85) };
    }),
    transactionVolume: dates.map((date) => {
      amountBase += rand(-500, 1500);
      return { date, amount: amountBase, count: rand(20, 80) };
    }),
    errorRates: dates.map((date) => ({ date, errors: rand(0, 12), warnings: rand(5, 40) })),
    engagement: dates.map((date) => {
      sessionBase += rand(-100, 200);
      return { date, sessions: sessionBase, pageviews: Math.floor(sessionBase * 3.2 + rand(-200, 200)) };
    }),
    alerts: [
      { id: "1", severity: "critical", title: "High error rate detected",
        description: "Error rate exceeded 2% threshold in the last 15 minutes.", timestamp: "2 min ago", resolved: false },
      { id: "2", severity: "warning", title: "Listing approval queue growing",
        description: "47 listings pending review, exceeding the 30-listing threshold.", timestamp: "18 min ago", resolved: false },
      { id: "3", severity: "info", title: "New user milestone reached",
        description: "Platform surpassed 1,250 registered users.", timestamp: "1 hr ago", resolved: true },
      { id: "4", severity: "warning", title: "Payment gateway latency spike",
        description: "P99 latency on payment processing rose to 3.2s.", timestamp: "3 hr ago", resolved: true },
    ],
    summary: {
      totalUsers: 1284, userChange: 8.4, activeListings: 356, listingChange: 3.1,
      totalRevenue: 128450, revenueChange: 12.7, errorRate: 0.8, errorChange: -2.3,
      avgSession: 4.2, sessionChange: 5.1,
    },
  };
}

function StatCard({ card }: { card: MetricCard }) {
  const Icon = card.icon;
  const up = card.change >= 0;
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${card.color}22` }}>
          <Icon className="h-5 w-5" style={{ color: card.color }} />
        </div>
        <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${up ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
          {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {Math.abs(card.change)}%
        </span>
      </div>
      <div>
        <p className="text-2xl font-bold text-white tabular-nums">{card.value}</p>
        <p className="text-sm text-gray-400 mt-0.5">{card.label}</p>
      </div>
      <div className="pointer-events-none absolute -bottom-6 -right-6 h-24 w-24 rounded-full blur-2xl opacity-20" style={{ background: card.color }} />
    </div>
  );
}

function ChartCard({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

function AlertBadge({ severity }: { severity: Alert["severity"] }) {
  const styles = {
    critical: "bg-red-500/10 text-red-400 border-red-500/20",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    info: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  };
  return (
    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${styles[severity]}`}>
      {severity}
    </span>
  );
}

function AlertsPanel({ alerts }: { alerts: Alert[] }) {
  const [showResolved, setShowResolved] = useState(false);
  const visible = showResolved ? alerts : alerts.filter((a) => !a.resolved);
  const unresolvedCount = alerts.filter((a) => !a.resolved).length;

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Bell className="h-4 w-4 text-amber-400" />
          Alerts
          {unresolvedCount > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
              {unresolvedCount}
            </span>
          )}
        </h3>
        <button onClick={() => setShowResolved(!showResolved)} className="text-xs text-gray-500 hover:text-gray-300 transition">
          {showResolved ? "Hide resolved" : "Show resolved"}
        </button>
      </div>
      {visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <CheckCircle className="h-8 w-8 text-emerald-500/50 mb-2" />
          <p className="text-sm text-gray-500">All clear — no active alerts</p>
        </div>
      ) : (
        <div className="space-y-2">
          {visible.map((alert) => (
            <div key={alert.id} className={`rounded-xl p-3 border transition-opacity ${alert.resolved ? "opacity-50 border-white/5" : alert.severity === "critical" ? "bg-red-500/5 border-red-500/10" : alert.severity === "warning" ? "bg-amber-500/5 border-amber-500/10" : "bg-blue-500/5 border-blue-500/10"}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 min-w-0">
                  {alert.resolved ? <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" /> : alert.severity === "critical" ? <XCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" /> : <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{alert.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{alert.description}</p>
                  </div>
                </div>
                <AlertBadge severity={alert.severity} />
              </div>
              <div className="flex items-center gap-1 mt-2 pl-6">
                <Clock className="h-3 w-3 text-gray-600" />
                <span className="text-[11px] text-gray-500">{alert.timestamp}</span>
                {alert.resolved && <span className="text-[11px] text-emerald-600 ml-2">· Resolved</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AnalyticsDashboardPage() {
  const [range, setRange] = useState<TimeRange>("30d");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [filter, setFilter] = useState<string>("all");

  const load = useCallback(() => {
    setLoading(true);
    setTimeout(() => { setData(generateData(range)); setLastRefresh(new Date()); setLoading(false); }, 600);
  }, [range]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { const interval = setInterval(load, 60_000); return () => clearInterval(interval); }, [load]);

  const handleExport = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `payeasy-analytics-${range}-${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  const metricCards: MetricCard[] = data ? [
    { label: "Total Users", value: data.summary.totalUsers.toLocaleString(), change: data.summary.userChange, icon: Users, color: "#7D00FF" },
    { label: "Active Listings", value: data.summary.activeListings.toLocaleString(), change: data.summary.listingChange, icon: Home, color: "#3b82f6" },
    { label: "Total Revenue", value: `$${data.summary.totalRevenue.toLocaleString()}`, change: data.summary.revenueChange, icon: CreditCard, color: "#10b981" },
    { label: "Error Rate", value: `${data.summary.errorRate}%`, change: data.summary.errorChange, icon: AlertTriangle, color: "#f59e0b" },
    { label: "Avg. Session", value: `${data.summary.avgSession}m`, change: data.summary.sessionChange, icon: Zap, color: "#ec4899" },
  ] : [];

  const timeRanges: { label: string; value: TimeRange }[] = [
    { label: "7D", value: "7d" }, { label: "30D", value: "30d" }, { label: "90D", value: "90d" },
  ];

  const filterOptions = [
    { label: "All", value: "all" }, { label: "Users", value: "users" },
    { label: "Listings", value: "listings" }, { label: "Payments", value: "payments" },
    { label: "Engagement", value: "engagement" }, { label: "Errors", value: "errors" },
  ];

  const filteredCards = metricCards.filter((c) =>
    filter === "all" ||
    (filter === "users" && c.label === "Total Users") ||
    (filter === "listings" && c.label === "Active Listings") ||
    (filter === "payments" && c.label === "Total Revenue") ||
    (filter === "engagement" && c.label === "Avg. Session") ||
    (filter === "errors" && c.label === "Error Rate")
  );

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary-500" />
            Analytics Dashboard
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Last updated: {lastRefresh.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-xl border border-white/10 bg-slate-800/60 p-1 gap-1">
            {timeRanges.map((r) => (
              <button key={r.value} onClick={() => setRange(r.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${range === r.value ? "bg-primary-500 text-white shadow" : "text-gray-400 hover:text-white"}`}>
                {r.label}
              </button>
            ))}
          </div>
          <button onClick={load} disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/10 bg-slate-800/60 text-xs text-gray-300 hover:text-white hover:bg-white/5 transition disabled:opacity-50">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button onClick={handleExport} disabled={!data}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/10 bg-slate-800/60 text-xs text-gray-300 hover:text-white hover:bg-white/5 transition disabled:opacity-50">
            <Download className="h-3.5 w-3.5" />
            Export JSON
          </button>
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2">
        {filterOptions.map((f) => (
          <button key={f.value} onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${filter === f.value ? "border-primary-500/50 bg-primary-500/10 text-primary-300" : "border-white/10 bg-transparent text-gray-400 hover:text-white hover:border-white/20"}`}>
            {f.label}
          </button>
        ))}
        {filter !== "all" && (
          <button onClick={() => setFilter("all")} className="px-3 py-1.5 rounded-full text-xs font-medium text-gray-500 hover:text-gray-300 transition">× Clear</button>
        )}
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => <div key={i} className="h-32 rounded-2xl border border-white/10 bg-slate-900/60 animate-pulse" />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-64 rounded-2xl border border-white/10 bg-slate-900/60 animate-pulse" />)}
          </div>
        </div>
      )}

      {data && !loading && (
        <>
          {/* Metric cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {filteredCards.map((card) => <StatCard key={card.label} card={card} />)}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {(filter === "all" || filter === "users") && (
              <ChartCard title="User Growth" action={<span className="text-xs text-gray-500 flex items-center gap-1"><TrendingUp className="h-3 w-3 text-emerald-400" /><span className="text-emerald-400">+{data.summary.userChange}%</span></span>}>
                <AnalyticsChart type="area" data={data.userGrowth} xKey="date" series={[{ key: "users", label: "Total Users", color: "#7D00FF" }, { key: "active", label: "Active", color: "#3b82f6" }]} />
              </ChartCard>
            )}
            {(filter === "all" || filter === "listings") && (
              <ChartCard title="Listing Volume">
                <AnalyticsChart type="bar" data={data.listingVolume} xKey="date" series={[{ key: "listings", label: "Total Listings", color: "#3b82f6" }, { key: "approved", label: "Approved", color: "#10b981" }]} />
              </ChartCard>
            )}
            {(filter === "all" || filter === "payments") && (
              <ChartCard title="Transaction Volume">
                <AnalyticsChart type="area" data={data.transactionVolume} xKey="date" formatY={(v) => `$${(v / 1000).toFixed(1)}k`} series={[{ key: "amount", label: "Revenue ($)", color: "#10b981" }, { key: "count", label: "Transactions", color: "#f59e0b" }]} />
              </ChartCard>
            )}
            {(filter === "all" || filter === "engagement") && (
              <ChartCard title="User Engagement">
                <AnalyticsChart type="area" data={data.engagement} xKey="date" series={[{ key: "sessions", label: "Sessions", color: "#ec4899" }, { key: "pageviews", label: "Page Views", color: "#8b5cf6" }]} />
              </ChartCard>
            )}
            {(filter === "all" || filter === "errors") && (
              <ChartCard title="Error Rates" action={<span className="text-xs text-gray-500">Errors &amp; warnings over time</span>}>
                <AnalyticsChart type="line" data={data.errorRates} xKey="date" series={[{ key: "errors", label: "Errors", color: "#ef4444" }, { key: "warnings", label: "Warnings", color: "#f59e0b" }]} />
              </ChartCard>
            )}
          </div>

          {/* Alerts + Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AlertsPanel alerts={data.alerts} />
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary-400" />
                Insights
              </h3>
              <div className="space-y-3">
                <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/10 p-4">
                  <p className="text-emerald-400 font-semibold text-sm mb-1">↑ Strong Growth</p>
                  <p className="text-gray-400 text-sm">Revenue up {data.summary.revenueChange}% over the selected period. User acquisition is accelerating.</p>
                </div>
                <div className="rounded-xl bg-amber-500/5 border border-amber-500/10 p-4">
                  <p className="text-amber-400 font-semibold text-sm mb-1">⚠ Monitor Listings</p>
                  <p className="text-gray-400 text-sm">Listing approval rate is at 85%. Consider reviewing the pending queue to improve throughput.</p>
                </div>
                <div className="rounded-xl bg-blue-500/5 border border-blue-500/10 p-4">
                  <p className="text-blue-400 font-semibold text-sm mb-1">✓ Low Error Rate</p>
                  <p className="text-gray-400 text-sm">Error rate of {data.summary.errorRate}% is below the 1% threshold. System health is stable.</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
