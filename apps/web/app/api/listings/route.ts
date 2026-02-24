import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { createListingSchema } from "@/lib/validators/listing";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    const { data, error } = await supabase
      .from("listings")
      .insert({
        ...listingData,
        landlord_id: user.id,
        status: "active",
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error creating listing:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}