import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/listings/compare?ids=xxx&ids=yyy
 * Fetch multiple listings by their IDs for comparison
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const ids = searchParams.getAll('ids')

    if (ids.length === 0) {
      return NextResponse.json(
        { error: 'No listing IDs provided', listings: [] },
        { status: 400 }
      )
    }

    // Limit to 4 IDs max
    const limitedIds = ids.slice(0, 4)

    const supabase = await createClient()

    const { data: listings, error } = await supabase
      .from('listings')
      .select(`
        *,
        listing_images(url, sort_order),
        users(username, avatar_url)
      `)
      .in('id', limitedIds)
      .eq('status', 'active')

    if (error) {
      console.error('Error fetching comparison listings:', error)
      return NextResponse.json(
        { error: 'Failed to fetch listings', listings: [] },
        { status: 500 }
      )
    }

    // Transform the response to match expected format
    const transformedListings = (listings ?? []).map((listing) => ({
      ...listing,
      images: listing.listing_images
        ?.sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order)
        .map((img: { url: string }) => img.url) ?? [],
      landlord: listing.users
        ? {
            username: listing.users.username,
            avatar_url: listing.users.avatar_url,
          }
        : null,
      // Remove nested objects
      listing_images: undefined,
      users: undefined,
    }))

    return NextResponse.json({
      listings: transformedListings,
      total: transformedListings.length,
    })
  } catch (error) {
    console.error('Unexpected error in compare API:', error)
    return NextResponse.json(
      { error: 'Internal server error', listings: [] },
      { status: 500 }
    )
  }
}
