'use client'

import React from 'react'
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardBadge, 
  CardAction,
  CardProps 
} from './Card'
import { 
  Home, 
  Star, 
  Heart, 
  MoreVertical, 
  TrendingUp,
  Users,
  DollarSign,
  CheckCircle2
} from 'lucide-react'

/**
 * Elevated Card Variant
 * Features: Shadow elevation, hover lift effect
 */
export function ElevatedCard() {
  return (
    <Card variant="elevated" hoverable>
      <CardHeader 
        title="Elevated Card" 
        subtitle="With shadow and hover effects"
      />
      <CardContent>
        <p className="text-sm">
          This card uses the elevated variant with shadow elevation that increases on hover.
          Perfect for drawing attention to important content.
        </p>
      </CardContent>
    </Card>
  )
}

/**
 * Outlined Card Variant
 * Features: Border focus, transparent background
 */
export function OutlinedCard() {
  return (
    <Card variant="outlined" hoverable>
      <CardHeader 
        title="Outlined Card" 
        subtitle="Clean border design"
      />
      <CardContent>
        <p className="text-sm">
          The outlined variant uses a border-focused design with a transparent background.
          Great for subtle content presentation.
        </p>
      </CardContent>
    </Card>
  )
}

/**
 * Filled Card Variant
 * Features: Background color, subtle border
 */
export function FilledCard() {
  return (
    <Card variant="filled" hoverable>
      <CardHeader 
        title="Filled Card" 
        subtitle="Background color variant"
      />
      <CardContent>
        <p className="text-sm">
          The filled variant has a subtle background color that darkens on hover.
          Ideal for grouping related content.
        </p>
      </CardContent>
    </Card>
  )
}

/**
 * Card with Icon Header
 * Features: Icon support in header area
 */
export function CardWithIcon() {
  return (
    <Card 
      variant="elevated" 
      hoverable
      icon={Home}
    >
      <CardHeader 
        title="Property Listing" 
        subtitle="123 Main Street, City"
      />
      <CardContent>
        <div className="space-y-2 text-sm">
          <p>3 Bedrooms • 2 Bathrooms</p>
          <p className="font-semibold text-primary">1,500 XLM/month</p>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Card with Badge
 * Features: Badge support with variants
 */
export function CardWithBadge() {
  return (
    <Card 
      variant="elevated" 
      hoverable
      icon={Star}
      badge={<CardBadge variant="primary">Featured</CardBadge>}
    >
      <CardHeader 
        title="Premium Listing" 
        subtitle="Top-rated property"
      />
      <CardContent>
        <div className="flex items-center gap-2 text-sm">
          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
          <span className="font-medium">4.9</span>
          <span className="text-gray-500">(128 reviews)</span>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Card with Actions
 * Features: Action buttons in header
 */
export function CardWithActions() {
  return (
    <Card 
      variant="elevated" 
      hoverable
      icon={Heart}
      actions={
        <>
          <CardAction icon={MoreVertical} aria-label="More options" />
        </>
      }
    >
      <CardHeader 
        title="Favorite Property" 
        subtitle="Saved for later"
      />
      <CardContent>
        <p className="text-sm">
          This card includes action buttons in the header area for quick interactions.
        </p>
      </CardContent>
    </Card>
  )
}

/**
 * Card with Footer
 * Features: Footer section with actions
 */
export function CardWithFooter() {
  return (
    <Card 
      variant="elevated" 
      hoverable
      icon={TrendingUp}
      footer={
        <div className="flex items-center justify-between">
          <button className="text-sm text-primary hover:underline">
            View Details
          </button>
          <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium">
            Book Now
          </button>
        </div>
      }
    >
      <CardHeader 
        title="Trending Property" 
        subtitle="High demand listing"
      />
      <CardContent>
        <p className="text-sm mb-4">
          This property has been viewed 500+ times this week.
        </p>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4 text-gray-400" />
            <span>12 interested</span>
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="h-4 w-4 text-gray-400" />
            <span>Price reduced</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Complete Card Example
 * Features: All features combined
 */
export function CompleteCard() {
  return (
    <Card 
      variant="elevated" 
      hoverable
      icon={Home}
      badge={<CardBadge variant="success">Available</CardBadge>}
      actions={
        <>
          <CardAction icon={Heart} aria-label="Add to favorites" />
          <CardAction icon={MoreVertical} aria-label="More options" />
        </>
      }
      header={
        <CardHeader 
          title="Luxury Apartment Downtown" 
          subtitle="Downtown District • Verified Listing"
        />
      }
      footer={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Verified</span>
          </div>
          <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium">
            View Details
          </button>
        </div>
      }
    >
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-6 text-sm">
            <div>
              <span className="text-gray-500">Bedrooms</span>
              <p className="font-semibold text-gray-900 dark:text-white">3</p>
            </div>
            <div>
              <span className="text-gray-500">Bathrooms</span>
              <p className="font-semibold text-gray-900 dark:text-white">2</p>
            </div>
            <div>
              <span className="text-gray-500">Size</span>
              <p className="font-semibold text-gray-900 dark:text-white">1,200 sqft</p>
            </div>
          </div>
          <div className="pt-2 border-t border-gray-100 dark:border-neutral-700">
            <p className="text-2xl font-bold text-primary">2,000 XLM</p>
            <p className="text-sm text-gray-500">per month</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Badge Variants Showcase
 */
export function BadgeVariants() {
  return (
    <div className="space-y-4">
      <Card variant="elevated">
        <CardHeader title="Badge Variants" />
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <CardBadge variant="default">Default</CardBadge>
            <CardBadge variant="primary">Primary</CardBadge>
            <CardBadge variant="success">Success</CardBadge>
            <CardBadge variant="warning">Warning</CardBadge>
            <CardBadge variant="danger">Danger</CardBadge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * All Variants Showcase
 */
export function AllVariants() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <ElevatedCard />
      <OutlinedCard />
      <FilledCard />
    </div>
  )
}
