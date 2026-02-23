'use client'

import React from 'react'
import { Button } from './Button'
import { ButtonGroup, ButtonGroupItem } from './ButtonGroup'
import { 
  Download, 
  Upload, 
  Save, 
  Trash2, 
  Edit, 
  Plus,
  Check,
  X,
  ArrowRight,
  Search
} from 'lucide-react'

/**
 * Primary Button Variants
 */
export function PrimaryButtons() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 items-center">
        <Button variant="primary" size="small">Small Primary</Button>
        <Button variant="primary" size="medium">Medium Primary</Button>
        <Button variant="primary" size="large">Large Primary</Button>
      </div>
      <div className="flex flex-wrap gap-4 items-center">
        <Button variant="primary" leftIcon={Plus}>Add Item</Button>
        <Button variant="primary" rightIcon={ArrowRight}>Continue</Button>
        <Button variant="primary" leftIcon={Save} rightIcon={Check}>Save Changes</Button>
      </div>
      <div className="flex flex-wrap gap-4 items-center">
        <Button variant="primary" fullWidth>Full Width Primary</Button>
      </div>
      <div className="flex flex-wrap gap-4 items-center">
        <Button variant="primary" isLoading>Loading...</Button>
        <Button variant="primary" disabled>Disabled</Button>
      </div>
    </div>
  )
}

/**
 * Secondary Button Variants
 */
export function SecondaryButtons() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 items-center">
        <Button variant="secondary" size="small">Small Secondary</Button>
        <Button variant="secondary" size="medium">Medium Secondary</Button>
        <Button variant="secondary" size="large">Large Secondary</Button>
      </div>
      <div className="flex flex-wrap gap-4 items-center">
        <Button variant="secondary" leftIcon={Edit}>Edit</Button>
        <Button variant="secondary" rightIcon={Search}>Search</Button>
      </div>
      <div className="flex flex-wrap gap-4 items-center">
        <Button variant="secondary" isLoading>Loading...</Button>
        <Button variant="secondary" disabled>Disabled</Button>
      </div>
    </div>
  )
}

/**
 * Tertiary/Ghost Button Variants
 */
export function TertiaryButtons() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 items-center">
        <Button variant="tertiary" size="small">Small Tertiary</Button>
        <Button variant="tertiary" size="medium">Medium Tertiary</Button>
        <Button variant="tertiary" size="large">Large Tertiary</Button>
      </div>
      <div className="flex flex-wrap gap-4 items-center">
        <Button variant="tertiary" leftIcon={Download}>Download</Button>
        <Button variant="tertiary" rightIcon={Upload}>Upload</Button>
      </div>
      <div className="flex flex-wrap gap-4 items-center">
        <Button variant="tertiary" isLoading>Loading...</Button>
        <Button variant="tertiary" disabled>Disabled</Button>
      </div>
    </div>
  )
}

/**
 * Button Group Examples
 */
export function ButtonGroupExamples() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
          Horizontal Attached
        </h3>
        <ButtonGroup attached>
          <Button variant="primary">Save</Button>
          <Button variant="primary">Cancel</Button>
          <Button variant="primary">Delete</Button>
        </ButtonGroup>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
          Horizontal Spaced
        </h3>
        <ButtonGroup>
          <Button variant="secondary">Edit</Button>
          <Button variant="secondary">Share</Button>
          <Button variant="secondary">Delete</Button>
        </ButtonGroup>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
          Vertical Attached
        </h3>
        <ButtonGroup orientation="vertical" attached>
          <Button variant="primary">Option 1</Button>
          <Button variant="primary">Option 2</Button>
          <Button variant="primary">Option 3</Button>
        </ButtonGroup>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
          Mixed Variants
        </h3>
        <ButtonGroup>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="tertiary">Tertiary</Button>
        </ButtonGroup>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
          With Icons
        </h3>
        <ButtonGroup>
          <Button variant="primary" leftIcon={Plus}>Add</Button>
          <Button variant="secondary" leftIcon={Edit}>Edit</Button>
          <Button variant="tertiary" leftIcon={Trash2}>Delete</Button>
        </ButtonGroup>
      </div>
    </div>
  )
}

/**
 * All States Showcase
 */
export function ButtonStates() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
          Default State
        </h3>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="tertiary">Tertiary</Button>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
          Loading State
        </h3>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary" isLoading>Loading</Button>
          <Button variant="secondary" isLoading>Loading</Button>
          <Button variant="tertiary" isLoading>Loading</Button>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
          Disabled State
        </h3>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary" disabled>Disabled</Button>
          <Button variant="secondary" disabled>Disabled</Button>
          <Button variant="tertiary" disabled>Disabled</Button>
        </div>
      </div>
    </div>
  )
}

/**
 * All Sizes Showcase
 */
export function ButtonSizes() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
          Small
        </h3>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary" size="small">Small</Button>
          <Button variant="secondary" size="small">Small</Button>
          <Button variant="tertiary" size="small">Small</Button>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
          Medium (Default)
        </h3>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary" size="medium">Medium</Button>
          <Button variant="secondary" size="medium">Medium</Button>
          <Button variant="tertiary" size="medium">Medium</Button>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
          Large
        </h3>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary" size="large">Large</Button>
          <Button variant="secondary" size="large">Large</Button>
          <Button variant="tertiary" size="large">Large</Button>
        </div>
      </div>
    </div>
  )
}

/**
 * Complete Example
 */
export function CompleteButtonExample() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          variant="primary" 
          size="large" 
          leftIcon={Plus}
          fullWidth
        >
          Create New Listing
        </Button>
        <Button 
          variant="secondary" 
          size="large"
          fullWidth
        >
          View All
        </Button>
      </div>

      <div className="flex gap-2">
        <Button 
          variant="primary" 
          leftIcon={Save}
          isLoading
        >
          Saving...
        </Button>
        <Button 
          variant="tertiary" 
          rightIcon={X}
        >
          Cancel
        </Button>
      </div>

      <ButtonGroup attached>
        <Button variant="primary" leftIcon={Edit}>Edit</Button>
        <Button variant="secondary" leftIcon={Download}>Export</Button>
        <Button variant="tertiary" leftIcon={Trash2}>Delete</Button>
      </ButtonGroup>
    </div>
  )
}
