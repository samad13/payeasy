import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createListingSchema } from "@/lib/validators/listing";
import { successResponse, handleError } from "@/app/api/utils/response";

/**
 * GET /api/listings
 * 
 * Returns a list of listings with optional search/query params.
 * Public (no auth required for browse).
 */
export async function GET(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") ?? undefined;
  
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    
    // Parse pagination params
    const limit = Math.min(Number(searchParams.get("limit")) || 20, 100);
    const offset = Number(searchParams.get("offset")) || 0;
    const status = searchParams.get("status") ?? "active";

    // Handle case where Supabase isn't configured (development/build)
    if (!supabase) {
      console.warn("Supabase client not available - returning empty listings");
      return successResponse({ 
        listings: [], 
        limit, 
        offset,
        total: 0
      });
    }

    // Query listings with count
    const { data, error, count } = await supabase
      .from("listings")
      .select(`
        id, 
        landlord_id, 
        title, 
        description, 
        monthly_rent_xlm, 
        contract_id, 
        status, 
        created_at, 
        updated_at,
        users!landlord_id (username, avatar_url)
      `, { count: "exact" })
      .eq("status", status)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return successResponse({
      listings: data ?? [],
      limit,
      offset,
      total: count ?? 0,
      hasMore: count ? offset + limit < count : false
    });
  } catch (err) {
    console.error("Error in GET /api/listings:", err);
    return handleError(err, requestId);
  }
}

/**
 * POST /api/listings
 * 
 * Creates a new listing.
 * Requires authentication.
 */
export async function POST(request: Request) {
  const requestId = request.headers.get("x-request-id") ?? undefined;
  
  try {
    const supabase = await createClient();
    
    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" }, 
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = createListingSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const listingData = validationResult.data;

    // Insert new listing
    const { data, error } = await supabase
      .from("listings")
      .insert({
        ...listingData,
        landlord_id: user.id,
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select(`
        id, 
        landlord_id, 
        title, 
        description, 
        monthly_rent_xlm, 
        contract_id, 
        status, 
        created_at, 
        updated_at
      `)
      .single();

    if (error) {
      console.error("Database error creating listing:", error);
      return NextResponse.json(
        { error: error.message }, 
        { status: 400 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/listings:", error);
    return handleError(error, requestId);
  }
}