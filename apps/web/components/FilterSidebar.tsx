"use client";

import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import * as Slider from "@radix-ui/react-slider";
import Select, { MultiValue, ActionMeta } from "react-select";
import debounce from "lodash.debounce";
import Link from "next/link";
import { X, List, Bookmark, ChevronDown } from "lucide-react";
import SaveSearchModal from "./SaveSearchModal";
import SavedSearchesList from "./SavedSearchesList";
'use client'

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import * as Slider from '@radix-ui/react-slider'
import Select, { MultiValue, ActionMeta } from 'react-select'
import debounce from 'lodash.debounce'
import Link from 'next/link'
import { X, List } from 'lucide-react'
import { trackEvent } from '@/lib/analytics/tracking'
import { AnalyticsEventName } from '@/lib/analytics/events'

// Types
type FilterState = {
    minPrice: number
    maxPrice: number
    bedrooms: string
    bathrooms: string
    furnished: boolean
    petFriendly: boolean
    amenities: string[]
    location: string
}

const AMENITIES_OPTIONS = [
    { value: 'wifi', label: 'Wifi' },
    { value: 'washer', label: 'Washer' },
    { value: 'dishwasher', label: 'Dishwasher' },
    { value: 'ac', label: 'AC' },
    { value: 'parking', label: 'Parking' },
    { value: 'gym', label: 'Gym' },
    { value: 'pool', label: 'Pool' },
    { value: 'elevator', label: 'Elevator' },
]

const BEDROOM_OPTIONS = [
    { value: '1', label: '1' },
    { value: '2', label: '2' },
    { value: '3', label: '3' },
    { value: '4', label: '4' },
    { value: '5', label: '5' },
    { value: '6+', label: '6+' },
]

const BATHROOM_OPTIONS = [
    { value: '1', label: '1' },
    { value: '2', label: '2' },
    { value: '3', label: '3' },
    { value: '4+', label: '4+' },
]

const LOCATION_SUGGESTIONS = [
    'Miami, FL',
    'New York, NY',
    'Los Angeles, CA',
    'Austin, TX',
    'Seattle, WA',
    'Chicago, IL',
    'Denver, CO'
]

const INITIAL_FILTERS: FilterState = {
    minPrice: 0,
    maxPrice: 5000,
    bedrooms: '',
    bathrooms: '',
    furnished: false,
    petFriendly: false,
    amenities: [],
    location: '',
}

export default function FilterSidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showSavedList, setShowSavedList] = useState(false);

  // Local state for autocomplete
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Hydrate from URL helper
  const getFiltersFromURL = useCallback((): FilterState => {
    if (!searchParams) return INITIAL_FILTERS;
    const params = new URLSearchParams(searchParams.toString());

    return {
      minPrice: Number(params.get("minPrice")) || INITIAL_FILTERS.minPrice,
      maxPrice: Number(params.get("maxPrice")) || INITIAL_FILTERS.maxPrice,
      bedrooms: params.get("bedrooms") || INITIAL_FILTERS.bedrooms,
      bathrooms: params.get("bathrooms") || INITIAL_FILTERS.bathrooms,
      furnished: params.get("furnished") === "true",
      petFriendly: params.get("petFriendly") === "true",
      amenities: params.get("amenities")
        ? params.get("amenities")!.split(",")
        : INITIAL_FILTERS.amenities,
      location: params.get("location") || INITIAL_FILTERS.location,
    };
  }, [searchParams]);

  // Initialize state
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);

  // Handle Hydration Layout Shift & Sync
  useEffect(() => {
    setMounted(true);
    setFilters(getFiltersFromURL());
  }, [getFiltersFromURL]);

  // Close suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- URL Sync Logic ---
  const updateURL = useCallback(
    (newFilters: FilterState) => {
      const params = new URLSearchParams();

      if (newFilters.minPrice > 0) params.set("minPrice", newFilters.minPrice.toString());
      if (newFilters.maxPrice < 5000) params.set("maxPrice", newFilters.maxPrice.toString());
      if (newFilters.bedrooms) params.set("bedrooms", newFilters.bedrooms);
      if (newFilters.bathrooms) params.set("bathrooms", newFilters.bathrooms);
      if (newFilters.furnished) params.set("furnished", "true");
      if (newFilters.petFriendly) params.set("petFriendly", "true");
      if (newFilters.amenities.length > 0) params.set("amenities", newFilters.amenities.join(","));
      if (newFilters.location) params.set("location", newFilters.location);

      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router]
  );

  // --- Debounced Updaters ---
  const debouncedUpdateURL = useMemo(
    () =>
      debounce((newFilters: FilterState) => {
        updateURL(newFilters);
      }, 500),
    [updateURL]
  );

  // --- Handlers ---

  const handlePriceChange = (value: number[]) => {
    const newFilters = { ...filters, minPrice: value[0], maxPrice: value[1] };
    setFilters(newFilters);
    debouncedUpdateURL(newFilters);
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const newFilters = { ...filters, location: val };
    setFilters(newFilters);
    debouncedUpdateURL(newFilters);
    setShowSuggestions(true);
  };

  const selectLocation = (loc: string) => {
    const newFilters = { ...filters, location: loc };
    setFilters(newFilters);
    debouncedUpdateURL(newFilters);
    setShowSuggestions(false);
  };

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    updateURL(newFilters);
  };

  const handleAmenitiesChange = (
    newValue: MultiValue<{ value: string; label: string }>,
    actionMeta: ActionMeta<{ value: string; label: string }>
  ) => {
    const selectedAmenities = newValue.map((item) => item.value);
    const newFilters = { ...filters, amenities: selectedAmenities };
    setFilters(newFilters);
    updateURL(newFilters);
  };

  const clearFilters = () => {
    setFilters(INITIAL_FILTERS);
    updateURL(INITIAL_FILTERS);
  };

  // Prevent hydration mismatch by returning skeleton or null until mounted
  if (!mounted)
    return (
      <div className="h-[600px] w-full max-w-sm animate-pulse rounded-xl border border-gray-100 bg-white p-6 shadow-lg">
        <div className="mb-6 h-6 w-32 rounded bg-gray-200"></div>
        <div className="space-y-6">
          <div className="h-10 rounded bg-gray-200"></div>
          <div className="h-12 rounded bg-gray-200"></div>
          <div className="h-12 rounded bg-gray-200"></div>
          <div className="h-12 rounded bg-gray-200"></div>
        </div>
      </div>
    );

  const filteredSuggestions = LOCATION_SUGGESTIONS.filter(
    (s) => s.toLowerCase().includes(filters.location.toLowerCase()) && s !== filters.location
  );

  const currentFiltersAsRecord: Record<string, unknown> = {
    ...(filters.minPrice > 0 ? { minPrice: filters.minPrice } : {}),
    ...(filters.maxPrice < 5000 ? { maxPrice: filters.maxPrice } : {}),
    ...(filters.bedrooms ? { bedrooms: filters.bedrooms } : {}),
    ...(filters.bathrooms ? { bathrooms: filters.bathrooms } : {}),
    ...(filters.furnished ? { furnished: true } : {}),
    ...(filters.petFriendly ? { petFriendly: true } : {}),
    ...(filters.amenities.length > 0 ? { amenities: filters.amenities } : {}),
    ...(filters.location ? { location: filters.location } : {}),
  };

  const handleRerun = (savedFilters: Record<string, unknown>) => {
    const params = new URLSearchParams();
    Object.entries(savedFilters).forEach(([k, v]) => {
      if (Array.isArray(v)) params.set(k, v.join(","));
      else if (v !== null && v !== undefined) params.set(k, String(v));
    });
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    setShowSavedList(false);
  };

  return (
    <>
    {showSaveModal && (
      <SaveSearchModal
        currentFilters={currentFiltersAsRecord}
        onClose={() => setShowSaveModal(false)}
        onSaved={() => setShowSavedList(true)}
      />
    )}
    <div className="h-fit w-full max-w-sm rounded-xl border border-gray-100 bg-white p-6 shadow-lg">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Filters</h2>
        <div className="flex items-center gap-2">
          <Link
            href="/listings"
            className="group flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            <List size={14} /> List All
          </Link>
          <div className="h-4 w-px bg-gray-200" />
          <button
            onClick={clearFilters}
            className="group flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-primary"
          >
            <X size={14} className="transition-transform group-hover:rotate-90" /> Clear all
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Location with Autocomplete */}
        <div className="relative" ref={suggestionsRef}>
          <label className="mb-2 block text-sm font-medium text-gray-700">Location</label>
          <input
            type="text"
            placeholder="City, Neighborhood, ZIP"
            value={filters.location}
            onChange={handleLocationChange}
            onFocus={() => setShowSuggestions(true)}
            className="w-full rounded-lg border border-gray-200 px-4 py-2 outline-none transition-all placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
          />

          {showSuggestions && filters.location && filteredSuggestions.length > 0 && (
            <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-gray-100 bg-white shadow-xl">
              {filteredSuggestions.map((loc) => (
                <button
                  key={loc}
                  onClick={() => selectLocation(loc)}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 hover:text-primary"
                >
                  {loc}
                </button>
              ))}
    const router = useRouter()
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const [mounted, setMounted] = useState(false)

    // Local state for autocomplete
    const [showSuggestions, setShowSuggestions] = useState(false)
    const suggestionsRef = useRef<HTMLDivElement>(null)

    // Hydrate from URL helper
    const getFiltersFromURL = useCallback((): FilterState => {
        if (!searchParams) return INITIAL_FILTERS
        const params = new URLSearchParams(searchParams.toString())

        return {
            minPrice: Number(params.get('minPrice')) || INITIAL_FILTERS.minPrice,
            maxPrice: Number(params.get('maxPrice')) || INITIAL_FILTERS.maxPrice,
            bedrooms: params.get('bedrooms') || INITIAL_FILTERS.bedrooms,
            bathrooms: params.get('bathrooms') || INITIAL_FILTERS.bathrooms,
            furnished: params.get('furnished') === 'true',
            petFriendly: params.get('petFriendly') === 'true',
            amenities: params.get('amenities') ? params.get('amenities')!.split(',') : INITIAL_FILTERS.amenities,
            location: params.get('location') || INITIAL_FILTERS.location,
        }
    }, [searchParams])

    // Initialize state
    const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS)

    // Handle Hydration Layout Shift & Sync
    useEffect(() => {
        setMounted(true)
        setFilters(getFiltersFromURL())
    }, [getFiltersFromURL])

    // Close suggestions on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
                setShowSuggestions(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // --- URL Sync Logic ---
    const updateURL = useCallback((newFilters: FilterState) => {
        const params = new URLSearchParams()

        if (newFilters.minPrice > 0) params.set('minPrice', newFilters.minPrice.toString())
        if (newFilters.maxPrice < 5000) params.set('maxPrice', newFilters.maxPrice.toString())
        if (newFilters.bedrooms) params.set('bedrooms', newFilters.bedrooms)
        if (newFilters.bathrooms) params.set('bathrooms', newFilters.bathrooms)
        if (newFilters.furnished) params.set('furnished', 'true')
        if (newFilters.petFriendly) params.set('petFriendly', 'true')
        if (newFilters.amenities.length > 0) params.set('amenities', newFilters.amenities.join(','))
        if (newFilters.location) params.set('location', newFilters.location)

        router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    }, [pathname, router])

    // --- Debounced Updaters ---
    const debouncedUpdateURL = useMemo(
        () => debounce((newFilters: FilterState) => {
            updateURL(newFilters)
        }, 500),
        [updateURL]
    )

    // --- Handlers ---

    const handlePriceChange = (value: number[]) => {
        const newFilters = { ...filters, minPrice: value[0], maxPrice: value[1] }
        setFilters(newFilters)
        debouncedUpdateURL(newFilters)
        trackEvent(AnalyticsEventName.BUTTON_CLICK, {
            button_id: 'price_range',
            text: `Price: ${value[0]} - ${value[1]}`,
            location: 'filter_sidebar',
        })
    }

    const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        const newFilters = { ...filters, location: val }
        setFilters(newFilters)
        debouncedUpdateURL(newFilters)
        setShowSuggestions(true)
    }

    const selectLocation = (loc: string) => {
        const newFilters = { ...filters, location: loc }
        setFilters(newFilters)
        debouncedUpdateURL(newFilters)
        setShowSuggestions(false)
        trackEvent(AnalyticsEventName.FORM_SUBMIT, {
            form_id: 'location_select',
            success: true,
            location: loc,
        })
    }

    const handleFilterChange = (key: keyof FilterState, value: any) => {
        const newFilters = { ...filters, [key]: value }
        setFilters(newFilters)
        updateURL(newFilters)
        trackEvent(AnalyticsEventName.BUTTON_CLICK, {
            button_id: key,
            value: value.toString(),
            location: 'filter_sidebar',
        })
    }

    const handleAmenitiesChange = (
        newValue: MultiValue<{ value: string; label: string }>,
        actionMeta: ActionMeta<{ value: string; label: string }>
    ) => {
        const selectedAmenities = newValue.map(item => item.value)
        const newFilters = { ...filters, amenities: selectedAmenities }
        setFilters(newFilters)
        updateURL(newFilters)
        trackEvent(AnalyticsEventName.FORM_SUBMIT, {
            form_id: 'amenities',
            success: true,
            count: selectedAmenities.length,
        })
    }

    const clearFilters = () => {
        setFilters(INITIAL_FILTERS)
        updateURL(INITIAL_FILTERS)
        trackEvent(AnalyticsEventName.BUTTON_CLICK, {
            button_id: 'clear_filters',
            text: 'Clear all',
            location: 'filter_sidebar',
        })
    }

    // Prevent hydration mismatch by returning skeleton or null until mounted
    if (!mounted) return (
        <div className="h-[600px] w-full max-w-sm animate-pulse rounded-xl border border-gray-100 bg-white p-6 shadow-lg dark:border-gray-800 dark:bg-slate-900">
            <div className="mb-6 h-6 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>
            <div className="space-y-6">
                <div className="h-10 rounded bg-gray-200 dark:bg-gray-700"></div>
                <div className="h-12 rounded bg-gray-200 dark:bg-gray-700"></div>
                <div className="h-12 rounded bg-gray-200 dark:bg-gray-700"></div>
                <div className="h-12 rounded bg-gray-200 dark:bg-gray-700"></div>
            </div>
        </div>
    )

    const filteredSuggestions = LOCATION_SUGGESTIONS.filter(
        s => s.toLowerCase().includes(filters.location.toLowerCase()) && s !== filters.location
    )

    return (
        <div className="h-fit w-full max-w-sm rounded-xl border border-gray-100 bg-white p-6 shadow-lg dark:border-gray-800 dark:bg-slate-900">
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Filters</h2>
                <div className="flex items-center gap-2">
                    <Link
                        href="/listings"
                        className="group flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80 dark:text-primary dark:hover:text-primary/80"
                    >
                        <List size={14} /> List All
                    </Link>
                    <div className="h-4 w-px bg-gray-200 dark:bg-gray-700" />
                    <button
                        onClick={clearFilters}
                        className="group flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-primary dark:text-gray-400 dark:hover:text-primary"
                    >
                        <X size={14} className="transition-transform group-hover:rotate-90" /> Clear all
                    </button>
                </div>
            </div>

            <div className="space-y-6">
                {/* Location with Autocomplete */}
                <div className="relative" ref={suggestionsRef}>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
                    <input
                        type="text"
                        placeholder="City, Neighborhood, ZIP"
                        value={filters.location}
                        onChange={handleLocationChange}
                        onFocus={() => setShowSuggestions(true)}
                        className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 outline-none transition-all placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-slate-800 dark:text-gray-100 dark:placeholder:text-gray-500"
                    />

                    {showSuggestions && filters.location && filteredSuggestions.length > 0 && (
                        <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-gray-100 bg-white shadow-xl dark:border-gray-700 dark:bg-slate-800">
                            {filteredSuggestions.map((loc) => (
                                <button
                                    key={loc}
                                    onClick={() => selectLocation(loc)}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 hover:text-primary dark:text-gray-300 dark:hover:bg-slate-700 dark:hover:text-primary"
                                >
                                    {loc}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Price Range */}
                <div>
                    <div className="mb-2 flex justify-between text-sm text-gray-600 dark:text-gray-400">
                        <span>Price Range</span>
                        <span className="rounded bg-primary/5 px-2 py-0.5 text-xs font-medium text-primary">
                            {filters.minPrice} - {filters.maxPrice} XLM
                        </span>
                    </div>
                    <Slider.Root
                        className="relative flex h-5 w-full touch-none select-none items-center"
                        value={[filters.minPrice, filters.maxPrice]}
                        max={5000}
                        step={50}
                        minStepsBetweenThumbs={1}
                        onValueChange={handlePriceChange}
                    >
                        <Slider.Track className="relative h-[4px] grow rounded-full bg-gray-100 dark:bg-gray-700">
                            <Slider.Range className="absolute h-full rounded-full bg-primary" />
                        </Slider.Track>
                        <Slider.Thumb
                            className="block h-5 w-5 cursor-grab rounded-full border border-gray-200 bg-white shadow-sm transition-all hover:scale-110 hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 active:cursor-grabbing dark:border-gray-600 dark:bg-slate-800"
                            aria-label="Min Price"
                        />
                        <Slider.Thumb
                            className="block h-5 w-5 cursor-grab rounded-full border border-gray-200 bg-white shadow-sm transition-all hover:scale-110 hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 active:cursor-grabbing dark:border-gray-600 dark:bg-slate-800"
                            aria-label="Max Price"
                        />
                    </Slider.Root>
                </div>

                {/* Bedrooms & Bathrooms */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Bedrooms</label>
                        <div className="relative">
                            <select
                                value={filters.bedrooms}
                                onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                                className="w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-slate-800 dark:text-gray-100"
                            >
                                <option value="">Any</option>
                                {BEDROOM_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 dark:text-gray-400">
                                <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Bathrooms</label>
                        <div className="relative">
                            <select
                                value={filters.bathrooms}
                                onChange={(e) => handleFilterChange('bathrooms', e.target.value)}
                                className="w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-slate-800 dark:text-gray-100"
                            >
                                <option value="">Any</option>
                                {BATHROOM_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 dark:text-gray-400">
                                <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Amenities */}
                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Amenities</label>
                    <Select
                        isMulti
                        options={AMENITIES_OPTIONS}
                        value={AMENITIES_OPTIONS.filter(opt => filters.amenities.includes(opt.value))}
                        onChange={handleAmenitiesChange}
                        className="react-select-container text-sm"
                        classNamePrefix="react-select"
                        placeholder="Select amenities..."
                        theme={(theme) => ({
                            ...theme,
                            colors: {
                                ...theme.colors,
                                primary: 'var(--color-primary-500, #7D00FF)',
                            },
                        })}
                        styles={{
                            control: (base, state) => ({
                                ...base,
                                borderColor: state.isFocused ? 'var(--color-primary-500, #7D00FF)' : '#E5E7EB',
                                boxShadow: state.isFocused ? '0 0 0 2px rgba(125, 0, 255, 0.2)' : 'none',
                                borderRadius: '0.5rem',
                                minHeight: '42px',
                                backgroundColor: 'var(--color-background, white)',
                                color: 'var(--color-foreground, black)',
                                '&:hover': {
                                    borderColor: state.isFocused ? 'var(--color-primary-500, #7D00FF)' : '#D1D5DB'
                                }
                            }),
                            multiValue: (base) => ({
                                ...base,
                                backgroundColor: 'var(--color-primary-50, #F3E8FF)',
                                borderRadius: '0.25rem',
                            }),
                            multiValueLabel: (base) => ({
                                ...base,
                                color: 'var(--color-primary-500, #7D00FF)',
                                fontWeight: 500,
                            }),
                            multiValueRemove: (base) => ({
                                ...base,
                                color: 'var(--color-primary-500, #7D00FF)',
                                ':hover': {
                                    backgroundColor: 'var(--color-primary-200, #E9D5FF)',
                                    color: 'var(--color-primary-800, #6B21A8)',
                                },
                            }),
                            menu: (base) => ({
                                ...base,
                                backgroundColor: 'var(--color-background, white)',
                                borderColor: 'var(--color-border, #E5E7EB)',
                            }),
                            option: (base, state) => ({
                                ...base,
                                backgroundColor: state.isFocused 
                                    ? 'var(--color-primary-50, #F3E8FF)' 
                                    : 'transparent',
                                color: 'var(--color-foreground, black)',
                            }),
                        }}
                    />
                </div>

                {/* Toggles */}
                <div className="space-y-4 pt-2">
                    <label className="group -mx-2 flex cursor-pointer items-center justify-between rounded-lg p-2 transition-colors hover:bg-gray-50 dark:hover:bg-slate-800/50">
                        <span className="text-sm font-medium text-gray-700 transition-colors group-hover:text-primary dark:text-gray-300">
                            Furnished
                        </span>
                        <div className="relative">
                            <input
                                type="checkbox"
                                checked={filters.furnished}
                                onChange={(e) => handleFilterChange('furnished', e.target.checked)}
                                className="peer sr-only"
                            />
                            <div className="peer h-6 w-10 rounded-full bg-gray-200 transition-colors after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 dark:bg-gray-700 dark:after:border-gray-600"></div>
                        </div>
                    </label>

                    <label className="group -mx-2 flex cursor-pointer items-center justify-between rounded-lg p-2 transition-colors hover:bg-gray-50 dark:hover:bg-slate-800/50">
                        <span className="text-sm font-medium text-gray-700 transition-colors group-hover:text-primary dark:text-gray-300">
                            Pet-Friendly
                        </span>
                        <div className="relative">
                            <input
                                type="checkbox"
                                checked={filters.petFriendly}
                                onChange={(e) => handleFilterChange('petFriendly', e.target.checked)}
                                className="peer sr-only"
                            />
                            <div className="peer h-6 w-10 rounded-full bg-gray-200 transition-colors after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 dark:bg-gray-700 dark:after:border-gray-600"></div>
                        </div>
                    </label>
                </div>
            </div>
        </div>
      </div>

      {/* Save Search & Saved Searches */}
      <div className="mt-6 space-y-3 border-t border-gray-100 pt-5">
        <div className="flex gap-2">
          <button
            onClick={() => setShowSaveModal(true)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
          >
            <Bookmark size={14} /> Save search
          </button>
          <button
            onClick={() => setShowSavedList((v) => !v)}
            className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50"
          >
            Saved <ChevronDown size={14} className={`transition-transform ${showSavedList ? "rotate-180" : ""}`} />
          </button>
        </div>
        {showSavedList && <SavedSearchesList onRerun={handleRerun} />}
      </div>
    </div>
    </>
  );
}
    )
}
