"use client";

import React from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export type ChartType = "area" | "bar" | "line";

export interface ChartSeries {
  key: string;
  label: string;
  color: string;
}

interface AnalyticsChartProps {
  type?: ChartType;
  data: Record<string, unknown>[];
  series: ChartSeries[];
  xKey?: string;
  height?: number;
  className?: string;
  formatY?: (value: number) => string;
}

const CustomTooltip = ({
  active,
  payload,
  label,
  formatY,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
  formatY?: (value: number) => string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/95 backdrop-blur-xl p-3 shadow-2xl text-xs min-w-[140px]">
      <p className="text-gray-400 mb-2 font-medium border-b border-white/5 pb-1.5">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-4 mt-1">
          <span className="flex items-center gap-1.5 text-gray-300">
            <span
              className="inline-block h-2 w-2 rounded-full flex-shrink-0"
              style={{ background: p.color }}
            />
            {p.name}
          </span>
          <span className="text-white font-semibold tabular-nums">
            {formatY
              ? formatY(p.value)
              : typeof p.value === "number"
              ? p.value.toLocaleString()
              : p.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export function AnalyticsChart({
  type = "area",
  data,
  series,
  xKey = "date",
  height = 220,
  className = "",
  formatY,
}: AnalyticsChartProps) {
  const commonProps = {
    data,
    margin: { top: 4, right: 4, left: -20, bottom: 0 },
  };

  const axisProps = {
    tick: { fill: "#6b7280", fontSize: 11 },
    axisLine: false,
    tickLine: false,
  };

  const gridProps = {
    strokeDasharray: "3 3",
    stroke: "rgba(255,255,255,0.05)",
    vertical: false,
  };

  const tooltipContent = <CustomTooltip formatY={formatY} />;

  return (
    <div className={className} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        {type === "bar" ? (
          <BarChart {...commonProps}>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey={xKey} {...axisProps} />
            <YAxis {...axisProps} tickFormatter={formatY} />
            <Tooltip content={tooltipContent} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
            <Legend wrapperStyle={{ fontSize: 11, color: "#9ca3af" }} iconType="circle" iconSize={8} />
            {series.map((s) => (
              <Bar
                key={s.key}
                dataKey={s.key}
                name={s.label}
                fill={s.color}
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
                fillOpacity={0.85}
              />
            ))}
          </BarChart>
        ) : type === "line" ? (
          <LineChart {...commonProps}>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey={xKey} {...axisProps} />
            <YAxis {...axisProps} tickFormatter={formatY} />
            <Tooltip content={tooltipContent} />
            <Legend wrapperStyle={{ fontSize: 11, color: "#9ca3af" }} iconType="circle" iconSize={8} />
            {series.map((s) => (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stroke={s.color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            ))}
          </LineChart>
        ) : (
          <AreaChart {...commonProps}>
            <defs>
              {series.map((s) => (
                <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={s.color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={s.color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey={xKey} {...axisProps} />
            <YAxis {...axisProps} tickFormatter={formatY} />
            <Tooltip content={tooltipContent} />
            <Legend wrapperStyle={{ fontSize: 11, color: "#9ca3af" }} iconType="circle" iconSize={8} />
            {series.map((s) => (
              <Area
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stroke={s.color}
                strokeWidth={2}
                fill={`url(#grad-${s.key})`}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            ))}
          </AreaChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
