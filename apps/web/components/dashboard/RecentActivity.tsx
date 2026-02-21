import Link from "next/link";
import { FileText, CreditCard, MessageSquare } from "lucide-react";

export type ActivityType = "listing" | "payment" | "message";

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  createdAt: string;
  link: string;
}

interface RecentActivityProps {
  activities: Activity[];
}

const getActivityIcon = (type: ActivityType) => {
  switch (type) {
    case "listing":
      return <FileText className="h-4 w-4" />;
    case "payment":
      return <CreditCard className="h-4 w-4" />;
    case "message":
      return <MessageSquare className="h-4 w-4" />;
  }
};

const getActivityColor = (type: ActivityType) => {
  switch (type) {
    case "listing":
      return "bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400";
    case "payment":
      return "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400";
    case "message":
      return "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400";
  }
};

function formatRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
}

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <div className="bg-white dark:bg-neutral-900 border rounded-xl shadow-sm overflow-hidden h-full flex flex-col">
      <div className="p-6 border-b border-gray-100 dark:border-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Recent Activity
        </h2>
      </div>
      <div className="divide-y divide-gray-100 dark:divide-gray-800 flex-1 overflow-auto">
        {activities.length === 0 ? (
           <div className="p-6 text-center text-gray-500 text-sm">
             No recent activity
           </div>
        ) : (
          activities.map((activity) => (
            <Link
              key={activity.id}
              href={activity.link}
              className="block p-4 hover:bg-gray-50 dark:hover:bg-neutral-800 transition"
            >
              <div className="flex items-start space-x-4">
                <div
                  className={`p-2 rounded-full flex-shrink-0 ${getActivityColor(
                    activity.type
                  )}`}
                >
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {activity.title}
                  </p>
                  <div className="flex items-center mt-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400 capitalize bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                      {activity.type}
                    </span>
                    <span className="mx-2 text-gray-300">•</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatRelativeTime(activity.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
