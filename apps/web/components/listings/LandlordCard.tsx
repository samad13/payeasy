'use client'

import React from 'react'
import Image from 'next/image'
import { Mail, Phone, MessageCircle } from 'lucide-react'

interface Landlord {
  id: string
  name: string
  email: string
  phone?: string
  avatar?: string
}

interface LandlordCardProps {
  landlord: Landlord
}

export default function LandlordCard({ landlord }: LandlordCardProps) {
  if (!landlord) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <p className="text-gray-500 text-center">Landlord information unavailable</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4 mb-4">
        <div className="relative h-16 w-16 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
          {landlord.avatar ? (
            <Image
              src={landlord.avatar}
              alt={landlord.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary text-xl font-bold">
              {landlord.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{landlord.name}</h3>
          <p className="text-sm text-gray-500">Property Owner</p>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-3 text-gray-600 text-sm">
          <Mail size={16} />
          <span className="truncate">{landlord.email}</span>
        </div>
        {landlord.phone && (
          <div className="flex items-center gap-3 text-gray-600 text-sm">
            <Phone size={16} />
            <span>{landlord.phone}</span>
          </div>
        )}
      </div>

      <button className="w-full py-2.5 px-4 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
        <MessageCircle size={18} />
        Message Landlord
      </button>
    </div>
  )
}
