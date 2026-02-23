"use client";

import Image from "next/image";
import Link from "next/link";
import { Listing } from "@/types/user";

interface UserListingsProps {
  listings: Listing[];
}

export default function UserListings({ listings }: UserListingsProps) {
  if (listings.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="bg-gray-100 p-4 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">This user has no active listings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {listings.map((listing) => (
        <Link 
          key={listing.id} 
          href={`/listings/${listing.id}`}
          className="group block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
        >
          <div className="relative aspect-[4/3] w-full bg-gray-200">
            <Image
              src={listing.imageUrl}
              alt={listing.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-md text-sm font-semibold text-gray-900 shadow-sm">
              ${listing.price.toLocaleString()}
            </div>
          </div>
          <div className="p-4 space-y-2">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 truncate transition-colors">
              {listing.title}
            </h3>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Added {new Date(listing.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
