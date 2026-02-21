import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface QuickActionCardProps {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
}

export function QuickActionCard({
  title,
  description,
  href,
  icon: Icon,
}: QuickActionCardProps) {
  return (
    <Link
      href={href}
      className="group block bg-white dark:bg-neutral-900 border rounded-xl shadow-sm hover:shadow-md transition p-6 h-full"
    >
      <div className="flex flex-col h-full items-start">
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg w-fit group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
          <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {title}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      </div>
    </Link>
  );
}
