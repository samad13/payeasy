'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import FilterSidebar from '../../components/FilterSidebar'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import ViewToggle from '../../components/ViewToggle'
import MapView from '../../components/MapView'
import type { MapListing } from '../../components/MapView'
import Image from 'next/image'
import { MapPin, Bed, Bath, UserCircle } from 'lucide-react'
import FavoriteButton from '../../components/FavoriteButton'

// Types for Mock Data
type Property = {
    id: number | string
    title: string
    price: number
    location: string
    bedrooms: number
    bathrooms: number
    image: string
    type: string
    latitude: number
    longitude: number
    rent_xlm?: number
}

const MOCK_PROPERTIES: Property[] = [
    {
        id: "mock-1",
        title: "Modern Loft in Downtown",
        price: 3200,
        location: "Miami, FL",
        bedrooms: 2,
        bathrooms: 2,
        image: "/images/airbnb1.jpg",
        type: 'Entire Place',
        latitude: 25.7751,
        longitude: -80.1947,
        rent_xlm: 3200,
    },
    {
        id: "mock-2",
        title: "Cozy Studio near Beach",
        price: 1800,
        location: "Miami Beach, FL",
        bedrooms: 1,
        bathrooms: 1,
        image: "/images/airbnb2.jpg",
        type: 'Private Room',
        latitude: 25.7907,
        longitude: -80.1300,
        rent_xlm: 1800,
    },
    {
        id: "mock-3",
        title: "Luxury Penthouse Suite",
        price: 4500,
        location: "Brickell, FL",
        bedrooms: 3,
        bathrooms: 3,
        image: "/images/airbnb3.jpg",
        type: 'Entire Place',
        latitude: 25.7588,
        longitude: -80.1936,
        rent_xlm: 4500,
    },
    {
        id: "mock-4",
        title: "Garden Apartment",
        price: 2400,
        location: "Coral Gables, FL",
        bedrooms: 1,
        bathrooms: 1,
        image: "/images/airbnb4.webp",
        type: 'Entire Place',
        latitude: 25.7215,
        longitude: -80.2684,
        rent_xlm: 2400,
    },
    {
        id: "mock-5",
        title: "Spacious Family Home",
        price: 3800,
        location: "Coconut Grove, FL",
        bedrooms: 4,
        bathrooms: 3,
        image: "/images/airbnb1.jpg",
        type: 'Entire Place',
        latitude: 25.7270,
        longitude: -80.2409,
        rent_xlm: 3800,
    },
    {
        id: "mock-6",
        title: "Minimalist City Condo",
        price: 2900,
        location: "Wynwood, FL",
        bedrooms: 2,
        bathrooms: 2,
        image: "/images/airbnb2.jpg",
        type: 'Private Room',
        latitude: 25.8051,
        longitude: -80.1996,
        rent_xlm: 2900,
    }
]

type ViewMode = 'grid' | 'map'

export default function BrowsePage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const pathname = usePathname()

    // View mode from URL
    const viewParam = searchParams?.get('view')
    const [viewMode, setViewMode] = useState<ViewMode>(
        viewParam === 'map' ? 'map' : 'grid'
    )

    // Derived state from URL params to filter the mock data
    const [filteredProperties, setFilteredProperties] = useState<Property[]>(MOCK_PROPERTIES)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    // Bbox state for map view client-side filtering
    const [mapBbox, setMapBbox] = useState<[number, number, number, number] | null>(null)

    const currentSortBy = searchParams?.get("sortBy") || "created_at";
    const currentOrder = searchParams?.get("order") || "desc";

    // Sync view mode from URL
    useEffect(() => {
        const v = searchParams?.get('view')
        setViewMode(v === 'map' ? 'map' : 'grid')
    }, [searchParams])

    // Fetch listings from API (with fallback to mock data)
    useEffect(() => {
        async function fetchListings() {
            setLoading(true);
            try {
                const query = searchParams?.toString() || "";
                const res = await fetch(`/api/listings/search?${query}`);
                if (res.ok) {
                    const data = await res.json();
                    // Transform API data to match Property interface if needed
                    const listings = (data.listings || []).map((l: any) => ({
                        id: l.id,
                        title: l.title,
                        price: l.rent_xlm,
                        rent_xlm: l.rent_xlm,
                        location: l.address,
                        bedrooms: l.bedrooms,
                        bathrooms: l.bathrooms,
                        image: l.images && l.images.length > 0 ? l.images[0] : "/images/airbnb1.jpg",
                        type: 'Entire Place', // Default type
                        latitude: l.latitude || 0,
                        longitude: l.longitude || 0,
                    }));
                    
                    if (listings.length > 0) {
                         setFilteredProperties(listings);
                         return;
                    }
                }
            } catch (e) {
                console.error("Failed to fetch listings", e);
            } finally {
                setLoading(false);
            }

            // Fallback to client-side filtering of mock data if API fails or returns empty
            if (!searchParams) return

            const minPrice = Number(searchParams.get('minPrice')) || 0
            const maxPrice = Number(searchParams.get('maxPrice')) || 5000
            const bedrooms = searchParams.get('bedrooms')
            const bathrooms = searchParams.get('bathrooms')
            const locationQuery = searchParams.get('location')

            let filtered = MOCK_PROPERTIES.filter(p => {
                const matchesPrice = p.price >= minPrice && p.price <= maxPrice
                const matchesBeds = bedrooms ? p.bedrooms >= Number(bedrooms) : true
                const matchesBaths = bathrooms ? p.bathrooms >= Number(bathrooms) : true
                const matchesLocation = locationQuery
                    ? p.location.toLowerCase().includes(locationQuery.toLowerCase())
                    : true

                return matchesPrice && matchesBeds && matchesBaths && matchesLocation
            })

            // Apply bbox filtering when in map view
            if (viewMode === 'map' && mapBbox) {
                const [west, south, east, north] = mapBbox
                filtered = filtered.filter(p =>
                    p.longitude >= west &&
                    p.longitude <= east &&
                    p.latitude >= south &&
                    p.latitude <= north
                )
            }

            setFilteredProperties(filtered)
        }
        
        fetchListings();
    }, [searchParams, viewMode, mapBbox])

    const handleClearFilters = () => {
        // We can just reload or push to base path
        window.location.href = '/browse'
    }

    // Build URL params preserving existing filter params
    const buildParams = useCallback(() => {
        if (!searchParams) return new URLSearchParams()
        const params = new URLSearchParams(searchParams.toString())
        return params
    }, [searchParams])

    const handleViewChange = useCallback(
        (newView: ViewMode) => {
            setViewMode(newView)
            const params = buildParams()

            if (newView === 'map') {
                params.set('view', 'map')
            } else {
                // Clear map-specific params when switching to grid
                params.delete('view')
                params.delete('lat')
                params.delete('lng')
                params.delete('zoom')
                params.delete('bbox')
                setMapBbox(null)
            }

            router.replace(`${pathname}?${params.toString()}`, { scroll: false })
        },
        [buildParams, pathname, router]
    )

    const handleBoundsChange = useCallback(
        (bbox: [number, number, number, number]) => {
            setMapBbox(bbox)
            const params = buildParams()
            params.set('view', 'map')
            params.set('bbox', bbox.map((v) => v.toFixed(4)).join(','))
            router.replace(`${pathname}?${params.toString()}`, { scroll: false })
        },
        [buildParams, pathname, router]
    )

    const handleViewStateChange = useCallback(
        (vs: { latitude: number; longitude: number; zoom: number }) => {
            const params = buildParams()
            params.set('view', 'map')
            params.set('lat', vs.latitude.toFixed(4))
            params.set('lng', vs.longitude.toFixed(4))
            params.set('zoom', vs.zoom.toFixed(1))
            router.replace(`${pathname}?${params.toString()}`, { scroll: false })
        },
        [buildParams, pathname, router]
    )
    
    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        const url = new URL(window.location.href);

        // Parse value like "price_desc"
        if (value === "recommended") {
            url.searchParams.set("sortBy", "recommended");
            url.searchParams.set("order", "desc");
        } else {
            const parts = value.split("_");
            const order = parts.pop() || "desc";
            const sortBy = parts.join("_");

            url.searchParams.set("sortBy", sortBy);
            url.searchParams.set("order", order);
        }

        // Preserve other search params, just update sorting
        window.location.href = url.pathname + url.search;
    };

    // Build initial view state from URL params
    const initialViewState = useMemo(() => {
        const lat = searchParams?.get('lat')
        const lng = searchParams?.get('lng')
        const zoom = searchParams?.get('zoom')

        if (lat && lng) {
            return {
                latitude: Number(lat),
                longitude: Number(lng),
                zoom: zoom ? Number(zoom) : 11,
            }
        }
        return undefined
    }, [searchParams])

    // Map listings with coordinates for MapView
    const mapListings: MapListing[] = useMemo(() => {
        return filteredProperties.map(p => ({
            id: String(p.id),
            latitude: p.latitude,
            longitude: p.longitude,
            price: p.price,
            title: p.title,
            location: p.location,
            bedrooms: p.bedrooms,
            bathrooms: p.bathrooms,
            image: p.image
        }));
    }, [filteredProperties])

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">P</div>
                        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">PayEasy Browse</h1>
                    </div>
                    <div 
                        className="relative"
                        onMouseEnter={() => setIsDropdownOpen(true)}
                        onMouseLeave={() => setIsDropdownOpen(false)}
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                        <div className="flex items-center gap-4 cursor-pointer">
                            <span className="text-sm font-medium text-gray-600 hidden sm:block">Demo User</span>
                            <div className="w-9 h-9 bg-gray-100 rounded-full border border-gray-200 flex items-center justify-center text-gray-400">
                                <UserCircle size={20} />
                            </div>
                        </div>
                        
                        {isDropdownOpen && (
                            <div className="absolute right-0 top-full pt-2 w-48 z-50">
                                <div className="bg-white rounded-md shadow-lg py-1 border border-gray-100">
                                    <Link href="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                        Dashboard
                                    </Link>
                                    <Link href="/auth/login" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                        Login
                                    </Link>
                                    <Link href="/auth/register" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                        Register
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Area */}
                    <aside className="w-full lg:w-80 flex-shrink-0">
                        <div className="sticky top-24">
                            <FilterSidebar />
                        </div>
                    </aside>

                    {/* Main Content Area */}
                    <div className="flex-1">

                        {/* Results Count, Sort & View Toggle */}
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-semibold text-gray-900">
                                {filteredProperties.length} Properties Found
                            </h2>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 text-sm text-gray-500 mr-2">
                                    <label htmlFor="sort-dropdown" className="hidden sm:block">Sort by:</label>
                                    <select
                                        id="sort-dropdown"
                                        value={
                                            currentSortBy === "recommended"
                                            ? "recommended"
                                            : `${currentSortBy}_${currentOrder}`
                                        }
                                        onChange={handleSortChange}
                                        className="rounded-md border-gray-300 bg-white py-1 pl-2 pr-8 text-sm font-medium text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                    >
                                        <option value="created_at_desc">Newest First</option>
                                        <option value="price_asc">Price: Low to High</option>
                                        <option value="price_desc">Price: High to Low</option>
                                        <option value="recommended">Recommended</option>
                                    </select>
                                </div>
                                <ViewToggle view={viewMode} onChange={handleViewChange} />
                            </div>
                        </div>

                        {/* Conditional: Grid View or Map View */}
                        {viewMode === 'map' ? (
                            <div className="h-[400px] lg:h-[calc(100vh-12rem)] rounded-xl overflow-hidden border border-gray-200">
                                <MapView
                                    listings={mapListings}
                                    initialViewState={initialViewState}
                                    onBoundsChange={handleBoundsChange}
                                    onViewStateChange={handleViewStateChange}
                                />
                            </div>
                        ) : (
                            /* Property Grid */
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {filteredProperties.length > 0 ? (
                                    filteredProperties.map((property) => (
                                        <Link href={`/listings/${property.id}`} key={property.id} className="block group h-full">
                                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group flex flex-col h-full">
                                                <div className="relative h-56 w-full overflow-hidden bg-gray-100">
                                                    <Image
                                                        src={property.image}
                                                        alt={property.title}
                                                        fill
                                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                    />
                                                    <div className="absolute top-3 left-3 z-10" onClick={(e) => e.preventDefault()}>
                                                        <FavoriteButton listingId={String(property.id)} />
                                                    </div>
                                                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold text-gray-900 shadow-sm z-10">
                                                        {property.type}
                                                    </div>
                                                </div>
                                                <div className="p-5 flex flex-col flex-1">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <h3 className="font-semibold text-gray-900 text-lg leading-tight mb-1 group-hover:text-primary transition-colors">{property.title}</h3>
                                                            <div className="flex items-center text-gray-500 text-sm gap-1">
                                                                <MapPin size={14} className="text-gray-400" />
                                                                {property.location}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between text-gray-600 text-sm">
                                                        <div className="flex items-center gap-4">
                                                            <div className="flex items-center gap-1.5" title={`${property.bedrooms} Bedrooms`}>
                                                                <Bed size={16} />
                                                                <span>{property.bedrooms}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5" title={`${property.bathrooms} Bathrooms`}>
                                                                <Bath size={16} />
                                                                <span>{property.bathrooms}</span>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="text-lg font-bold text-primary">{property.rent_xlm || property.price} XLM</span>
                                                            <span className="text-xs text-gray-400 ml-1">/ mo</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="col-span-full py-16 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                                        <div className="inline-flex items-center justify-center p-4 bg-gray-50 rounded-full mb-4">
                                            <MapPin size={32} className="text-gray-300" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-1">No properties found</h3>
                                        <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">
                                            We couldn&apos;t find any matches for your current filters. Try adjusting your search criteria.
                                        </p>
                                        <button
                                            onClick={handleClearFilters}
                                            className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm shadow-sm shadow-primary/20"
                                        >
                                            Clear all filters
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
