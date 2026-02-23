import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ListingSearchParams, ListingSearchResult } from "@/lib/db/types";
import type { ListingRow, ListingAmenityRow } from "@/lib/types/database";

export async function GET(request: NextRequest) {
  // MOCK DATA MODE - Database connection bypassed
  const searchParams = request.nextUrl.searchParams;
  const page = searchParams.get("page") ? Number(searchParams.get("page")) : 1;
  const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : 20;

  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 500));

  const mockListings = Array.from({ length: 25 }).map((_, i) => ({
    id: `mock-${i + 1}`,
    landlord_id: "mock-landlord",
    title: `Mock Listing ${i + 1}`,
    description: "This is a mock listing for testing purposes.",
    address: `123 Mock St, City ${i + 1}`,
    rent_xlm: 1000 + i * 50,
    bedrooms: (i % 3) + 1,
    bathrooms: (i % 2) + 1,
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [`/images/airbnb${(i % 4) + 1}.${(i % 4) + 1 === 4 ? 'webp' : 'jpg'}`],
    landlord: {
      username: "Demo User",
      avatar_url: null,
    },
  }));

  // Pagination for mock data
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedMock = mockListings.slice(startIndex, endIndex);

  return NextResponse.json({
    listings: paginatedMock,
    total: mockListings.length,
    page: page,
    limit: limit,
    totalPages: Math.ceil(mockListings.length / limit),
  });
}
