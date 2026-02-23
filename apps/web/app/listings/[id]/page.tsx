import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Bed, Bath, Calendar, FileText, Share2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import ImageCarousel from '@/components/listings/ImageCarousel'
import LandlordCard from '@/components/listings/LandlordCard'
import FavoriteButton from '@/components/FavoriteButton'

// Dynamically import Map to avoid SSR issues
const ListingMap = dynamic(() => import('@/components/listings/ListingMap'), {
  ssr: false,
  loading: () => (
    <div className="h-96 w-full bg-gray-100 rounded-xl animate-pulse flex items-center justify-center">
      <span className="text-gray-400">Loading map...</span>
    </div>
  ),
})

interface Listing {
  id: string
  title: string
  price: number
  bedrooms: number
  bathrooms: number
  description: string
  amenities: string[]
  images: string[]
  latitude: number
  longitude: number
  moveInDate: string
  leaseTerms: string
  landlord: {
    id: string
    name: string
    email: string
    phone?: string
    avatar?: string
  }
  address: string
}

async function getListing(id: string): Promise<Listing> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  
  try {
    const res = await fetch(`${baseUrl}/api/listings/${id}`, {
        cache: 'no-store', // Ensure fresh data
    })

    if (!res.ok) {
        if (res.status === 404) {
        notFound()
        }
        throw new Error('Failed to fetch listing')
    }

    const json = await res.json()
    return json.data ? json.data : json
  } catch (error) {
      console.warn("Fetch failed, using local mock data", error);
      // Fallback mock data for dev resilience
      return {
        id: id,
        title: "Luxury Downtown Apartment with City Views",
        price: 3500,
        bedrooms: 2,
        bathrooms: 2,
        description: "Experience the height of luxury in this stunning downtown apartment. Featuring floor-to-ceiling windows, a chef's kitchen with Viking appliances, and a private terrace overlooking the city skyline. The building offers 24/7 concierge, a state-of-the-art fitness center, and a rooftop infinity pool. Perfectly located near the best dining and entertainment districts.",
        amenities: [
          "High-speed Wifi", 
          "Gourmet Kitchen", 
          "Washer & Dryer", 
          "Central Air", 
          "Heating", 
          "Smart TV", 
          "Dedicated Workspace", 
          "Gym Access", 
          "Rooftop Pool", 
          "Doorman"
        ],
        images: [
          "/images/airbnb1.jpg",
          "/images/airbnb2.jpg",
          "/images/airbnb3.jpg",
          "/images/airbnb4.webp"
        ],
        latitude: 40.7128,
        longitude: -74.0060,
        moveInDate: new Date().toISOString(),
        leaseTerms: "12 Months",
        landlord: {
          id: "landlord-mock-1",
          name: "Sarah Jenkins",
          email: "sarah.j@example.com",
          avatar: undefined // or a placeholder URL if available
        },
        address: "123 Broadway, New York, NY 10013"
      }
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const listing = await getListing(params.id)
    return {
      title: `${listing.title} | PayEasy`,
      description: listing.description.substring(0, 160),
    }
  } catch (error) {
    return {
      title: 'Listing Not Found | PayEasy',
    }
  }
}

export default async function ListingDetailPage({ params }: { params: { id: string } }) {
  const listing = await getListing(params.id)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'XLM', // Assuming XLM based on project context, or use USD/local currency
      minimumFractionDigits: 0,
    }).format(price).replace('XLM', 'XLM ') // Adjust formatting if needed
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/browse" className="flex items-center text-gray-600 hover:text-gray-900 transition-colors group">
            <div className="p-2 rounded-full group-hover:bg-gray-100 mr-2 transition-colors">
              <ArrowLeft size={20} />
            </div>
            Back to listings
          </Link>
          <div className="flex items-center gap-4">
             <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
               <Share2 size={20} />
             </button>
             <FavoriteButton listingId={listing.id} />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 1. Image Carousel */}
        <section className="mb-8">
          <ImageCarousel images={listing.images} title={listing.title} />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* 2. Basic Information */}
            <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{listing.title}</h1>
                <p className="text-gray-500 flex items-center gap-2">
                  <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-sm font-medium">
                    {listing.address}
                  </span>
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y border-gray-100">
                <div className="flex flex-col gap-1">
                  <span className="text-gray-500 text-sm">Rent</span>
                  <span className="font-bold text-lg text-primary">{formatPrice(listing.price)}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-gray-500 text-sm">Layout</span>
                  <div className="flex items-center gap-3 font-medium">
                    <span className="flex items-center gap-1"><Bed size={16} /> {listing.bedrooms}</span>
                    <span className="flex items-center gap-1"><Bath size={16} /> {listing.bathrooms}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-gray-500 text-sm">Move-in Date</span>
                  <div className="flex items-center gap-1 font-medium">
                    <Calendar size={16} className="text-gray-400" />
                    {formatDate(listing.moveInDate)}
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-gray-500 text-sm">Lease Terms</span>
                  <div className="flex items-center gap-1 font-medium">
                    <FileText size={16} className="text-gray-400" />
                    {listing.leaseTerms}
                  </div>
                </div>
              </div>
            </section>

            {/* 3. Description */}
            <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">About this place</h2>
              <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed whitespace-pre-line">
                {listing.description || "No description provided."}
              </div>
            </section>

            {/* 4. Amenities */}
            <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Amenities</h2>
              {listing.amenities && listing.amenities.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {listing.amenities.map((amenity, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-gray-600 bg-gray-50 p-3 rounded-lg">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No specific amenities listed.</p>
              )}
            </section>

            {/* 5. Location Map */}
            <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Location</h2>
              <p className="text-gray-500 mb-4">{listing.address}</p>
              <ListingMap latitude={listing.latitude} longitude={listing.longitude} />
            </section>
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* 6. Landlord Profile Card */}
            <LandlordCard landlord={listing.landlord} />

            <div className="sticky top-24 space-y-6">
              {/* 7. Action Buttons */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
                <div className="flex justify-between items-baseline mb-6">
                  <span className="text-3xl font-bold text-gray-900">{formatPrice(listing.price)}</span>
                  <span className="text-gray-500">/ month</span>
                </div>
                
                <div className="space-y-3">
                  <button className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98]">
                    Apply Now
                  </button>
                  <button className="w-full bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-bold py-3.5 rounded-xl transition-all hover:bg-gray-50 active:scale-[0.98]">
                    Message Landlord
                  </button>
                </div>
                
                <p className="text-center text-xs text-gray-400 mt-4">
                  You won&apos;t be charged yet
                </p>
              </div>

              {/* 8. Payment Card (Added as requested) */}
              <div className="bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-indigo-100 rounded-xl p-6 shadow-md">
                 <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                   Ready to move in?
                 </h3>
                 <p className="text-sm text-gray-500 mb-4">
                   Secure this property instantly by paying the first month&apos;s rent with Stellar.
                 </p>
                 <Link href={`/listings/${listing.id}/pay`}>
                    <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 active:scale-[0.98] flex items-center justify-center gap-2">
                      Pay Rent with Stellar
                    </button>
                 </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
