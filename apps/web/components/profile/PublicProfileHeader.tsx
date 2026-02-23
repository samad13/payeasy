"use client";

import Image from "next/image";
import Link from "next/link";
import { PublicUser } from "@/types/user";

// Simulate authentication utility
const useIsAuthenticated = () => {
  // In a real app, this would use the auth context
  return true; 
};

interface PublicProfileHeaderProps {
  user: PublicUser;
}

export default function PublicProfileHeader({ user }: PublicProfileHeaderProps) {
  const isAuthenticated = useIsAuthenticated();

  // Handle date formatting
  let formattedDate = "";
  try {
    formattedDate = new Date(user.memberSince).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  } catch (e) {
    formattedDate = "Unknown date";
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        {/* Avatar */}
        <div className="relative h-24 w-24 flex-shrink-0 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-sm ring-1 ring-gray-100">
          {user.avatarUrl ? (
            <Image
              src={user.avatarUrl}
              alt={user.username}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 96px, 96px"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-gray-200 text-gray-500 text-3xl font-bold">
              {user.username.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0 space-y-2 w-full">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 truncate">{user.username}</h1>
              {user.rating ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                  ⭐ {user.rating}
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                  ⭐ New
                </span>
              )}
            </div>
            
            {/* Actions */}
            {isAuthenticated && (
               <Link
                href={`/chat/${user.id}`}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Message
              </Link>
            )}
          </div>

          <p className="text-gray-600 max-w-2xl line-clamp-2">{user.bio || "No bio provided."}</p>

          <div className="flex items-center gap-4 text-sm text-gray-500 pt-1">
            <span className="flex items-center gap-1">
              Member since {formattedDate}
            </span>
            <span className="text-gray-300">•</span>
            <span className="font-medium text-gray-700">{user.listingsCount} listings</span>
          </div>
        </div>
      </div>
    </div>
  );
}
