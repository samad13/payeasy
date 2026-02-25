import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase/server";
import type { ListingSearchParams, ListingSearchResult } from "@/lib/db/types";
import { successResponse, errorResponse, handleError } from "@/app/api/utils";

// Mock data generation function
const generateMockListings = (count: number = 25) => {
  return Array.from({ length: count }).map((_, i) => ({
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
};

// Parse search parameters from URL
const parseSearchParams = (searchParams: URLSearchParams): ListingSearchParams & { bbox?: string } => {
  return {
    minPrice: searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined,
    maxPrice: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined,
    location: searchParams.get("location") || undefined,
    radius: searchParams.get("radius") || undefined,
    bedrooms: searchParams.get("bedrooms") ? Number(searchParams.get("bedrooms")) : undefined,
    bathrooms: searchParams.get("bathrooms") ? Number(searchParams.get("bathrooms")) : undefined,
    amenities: searchParams.get("amenities")
      ? searchParams.get("amenities")!.split(",").map((a) => a.trim())
      : undefined,
    search: searchParams.get('search') || undefined,
    bbox: searchParams.get('bbox') || undefined,
    sortBy: (searchParams.get('sortBy') as 'price' | 'created_at' | 'bedrooms' | 'bathrooms' | 'views' | 'favorites' | 'recommended') || 'created_at',
    order: (searchParams.get('order') as 'asc' | 'desc') || 'desc',
    page: Math.max(1, Number(searchParams.get('page')) || 1),
    limit: Math.min(100, Math.max(1, Number(searchParams.get('limit')) || 20)),
  };
};

// Build Supabase query from params
const buildQuery = (supabase: any, params: ListingSearchParams & { bbox?: string }) => {
  let query = supabase
    .from('listings')
    .select('*, listing_images(url, sort_order), users(username, avatar_url)', { count: 'exact' })
    .eq('status', 'active');

  // Price filters
  if (params.minPrice !== undefined) {
    query = query.gte("rent_xlm", params.minPrice);
  }
  if (params.maxPrice !== undefined) {
    query = query.lte("rent_xlm", params.maxPrice);
  }

  // Room filters
  if (params.bedrooms !== undefined) {
    query = query.eq("bedrooms", params.bedrooms);
  }
  if (params.bathrooms !== undefined) {
    query = query.eq("bathrooms", params.bathrooms);
  }

  // Search filter
  if (params.search) {
    const searchTerm = `%${params.search}%`;
    query = query.or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`);
  }

  // Location filter (simplified - just address contains)
  if (params.location) {
    query = query.ilike("address", `%${params.location}%`);
  }

  // Sorting
  if (params.sortBy === "recommended") {
    query = query
      .order("favorite_count", { ascending: false })
      .order("view_count", { ascending: false })
      .order("created_at", { ascending: false });
  } else {
    const sortColumn = 
      params.sortBy === "price" ? "rent_xlm" :
      params.sortBy === "views" ? "view_count" :
      params.sortBy === "favorites" ? "favorite_count" :
      params.sortBy || "created_at";
    
    query = query.order(sortColumn, { ascending: params.order === "asc" });
  }

  // Pagination
  const offset = (params.page! - 1) * params.limit!;
  query = query.range(offset, offset + params.limit! - 1);

  return query;
};

// Apply amenity filtering (requires separate query)
const applyAmenityFilter = async (
  supabase: any,
  listings: any[],
  amenities: string[]
): Promise<any[]> => {
  if (!amenities?.length || !listings?.length) return listings;

  const listingIds = listings.map((l: any) => l.id);
  const { data: amenityData, error: amenityError } = await supabase
    .from("listing_amenities")
    .select("listing_id, amenity")
    .in("listing_id", listingIds)
    .in("amenity", amenities);

  if (amenityError) {
    console.error("Amenity filter error:", amenityError);
    return listings; // Return unfiltered if amenity query fails
  }

  // Group amenities by listing
  const listingAmenities = new Map<string, Set<string>>();
  amenityData?.forEach((item: { listing_id: string; amenity: string }) => {
    if (!listingAmenities.has(item.listing_id)) {
      listingAmenities.set(item.listing_id, new Set());
    }
    listingAmenities.get(item.listing_id)!.add(item.amenity);
  });

  // Filter listings that have all requested amenities
  return listings.filter((listing: any) => {
    const listingAmenitySet = listingAmenities.get(listing.id) || new Set();
    return amenities.every((amenity) => listingAmenitySet.has(amenity));
  });
};

// Transform raw listing data to expected format
const transformListings = (listings: any[]): any[] => {
  return listings.map((listing: any) => ({
    ...listing,
    images: listing.listing_images
      ? listing.listing_images
          .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
          .map((img: any) => img.url)
      : [],
    landlord: listing.users
  }));
};

// Return mock data response
const mockDataResponse = (params: ListingSearchParams & { bbox?: string }) => {
  const mockListings = generateMockListings(25);
  const startIndex = (params.page! - 1) * params.limit!;
  const endIndex = startIndex + params.limit!;
  const paginatedMock = mockListings.slice(startIndex, endIndex);

  return NextResponse.json({
    listings: paginatedMock,
    total: mockListings.length,
    page: params.page!,
    limit: params.limit!,
    totalPages: Math.ceil(mockListings.length / params.limit!),
  });
};

export async function GET(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") ?? undefined;
  
  try {
    const supabase = getServerClient();
    const params = parseSearchParams(request.nextUrl.searchParams);

    // If no Supabase client or explicitly in mock mode, return mock data
    if (!supabase || process.env.USE_MOCK_DATA === 'true') {
      console.warn("Using mock data for listings API");
      return mockDataResponse(params);
    }

    // Build and execute query
    const query = buildQuery(supabase, params);
    const { data: listings, error, count } = await query;

    if (error) {
      console.error("Database error:", error);
      // Fallback to mock data on database error
      return mockDataResponse(params);
    }

    // If no results, return empty array with pagination info
    if (!listings || listings.length === 0) {
      return successResponse({
        listings: [],
        total: 0,
        page: params.page!,
        limit: params.limit!,
        totalPages: 0,
      });
    }

    // Transform listings
    let transformedListings = transformListings(listings);
    let finalCount = count || 0;

    // Apply amenity filtering if needed
    if (params.amenities && params.amenities.length > 0) {
      transformedListings = await applyAmenityFilter(supabase, transformedListings, params.amenities);
      finalCount = transformedListings.length;
    }

    const totalPages = Math.ceil(finalCount / params.limit!);

    const result: ListingSearchResult = {
      listings: transformedListings,
      total: finalCount,
      page: params.page!,
      limit: params.limit!,
      totalPages,
    };

    return successResponse(result);
  } catch (err) {
    console.error("Unexpected error in listings API:", err);
    return handleError(err, requestId);
  }
}