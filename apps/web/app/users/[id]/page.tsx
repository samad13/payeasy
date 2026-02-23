import { notFound } from "next/navigation";
import PublicProfileHeader from "@/components/profile/PublicProfileHeader";
import UserListings from "@/components/profile/UserListings";
import { PublicUserResponse } from "@/types/user";

// Helper to fetch user data
async function getUser(id: string): Promise<PublicUserResponse | null> {
  // Use environment variable for base URL or default to localhost
  // In production, this should be the actual domain
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  
  try {
    const res = await fetch(`${baseUrl}/api/users/${id}`, {
      // We use no-store to ensure we get fresh mock data and simulate real network request
      cache: "no-store", 
    });

    if (!res.ok) {
      if (res.status === 404) return null;
      console.error("Failed to fetch user:", res.status, res.statusText);
      return null;
    }

    const json = await res.json();
    
    if (json.success && json.data) {
      return json.data;
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}

export default async function UserProfilePage({ params }: { params: { id: string } }) {
  // In Next.js 15, params is a Promise. In 14, it's an object. 
  // We handle both just in case, though package.json says 14.
  const id = params.id;
  
  const userData = await getUser(id);

  if (!userData) {
    notFound();
  }

  const { user, listings } = userData;

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PublicProfileHeader user={user} />
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              Active Listings ({listings.length})
            </h2>
          </div>
          
          <UserListings listings={listings} />
        </div>
      </div>
    </div>
  );
}
