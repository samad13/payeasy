'use client'

import React from 'react'
import MapGL, { Marker, NavigationControl } from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { MapPin } from 'lucide-react'

interface ListingMapProps {
  latitude: number
  longitude: number
}

export default function ListingMap({ latitude, longitude }: ListingMapProps) {
  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

  if (!MAPBOX_TOKEN) {
    return (
      <div className="h-64 w-full bg-gray-50 rounded-xl border border-dashed border-gray-300 flex flex-col items-center justify-center gap-2 p-8 text-center">
        <p className="text-gray-500 text-sm font-medium">
          Map requires a Mapbox token
        </p>
      </div>
    )
  }

  return (
    <div className="h-96 w-full rounded-xl overflow-hidden shadow-sm border border-gray-200 relative z-0">
      <MapGL
        initialViewState={{
          latitude,
          longitude,
          zoom: 14
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/light-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
        scrollZoom={false}
      >
        <NavigationControl position="top-right" />
        <Marker latitude={latitude} longitude={longitude} anchor="bottom">
            <div className="bg-primary text-white p-2 rounded-full shadow-lg transform hover:scale-110 transition-transform">
               <MapPin size={24} fill="currentColor" />
            </div>
        </Marker>
      </MapGL>
    </div>
  )
}
