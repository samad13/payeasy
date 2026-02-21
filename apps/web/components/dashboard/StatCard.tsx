import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon?: LucideIcon;
  className?: string;
}

export function StatCard({ title, value, description, icon: Icon, className }: StatCardProps) {
  return (
    <div className={cn("bg-white dark:bg-neutral-900 border rounded-xl shadow-sm hover:shadow-md transition p-6", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {title}
        </h3>
        {Icon && <Icon className="h-5 w-5 text-gray-400" />}
      </div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white">
        {value}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        {description}
      </p>
    </div>
  );
}
