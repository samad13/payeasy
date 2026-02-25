'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button, type ButtonVariant } from './Button'
import { cn } from '@/lib/utils'

export type BannerVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger'

export interface BannerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title: React.ReactNode
  description?: React.ReactNode
  eyebrow?: React.ReactNode
  icon?: LucideIcon
  ctaLabel?: string
  ctaHref?: string
  onCtaClick?: () => void
  ctaVariant?: ButtonVariant
  secondaryAction?: React.ReactNode
  variant?: BannerVariant
  backgroundImageSrc?: string
  backgroundImageAlt?: string
  dismissible?: boolean
  onDismiss?: () => void
}

const bannerVariantStyles: Record<BannerVariant, string> = {
  default:
    'border-gray-200 bg-white text-gray-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white',
  primary:
    'border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent text-gray-900 dark:text-white',
  success:
    'border-green-200 bg-gradient-to-r from-green-50 to-white text-gray-900 dark:border-green-800 dark:from-green-950/20 dark:to-neutral-900 dark:text-white',
  warning:
    'border-amber-200 bg-gradient-to-r from-amber-50 to-white text-gray-900 dark:border-amber-800 dark:from-amber-950/20 dark:to-neutral-900 dark:text-white',
  danger:
    'border-red-200 bg-gradient-to-r from-red-50 to-white text-gray-900 dark:border-red-800 dark:from-red-950/20 dark:to-neutral-900 dark:text-white',
}

function bannerCtaLinkClasses(variant: ButtonVariant) {
  const base =
    'inline-flex min-h-[44px] items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98]'

  const variants: Record<ButtonVariant, string> = {
    primary: 'bg-primary text-white hover:bg-primary/90 focus:ring-primary',
    secondary:
      'border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 focus:ring-gray-400 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700',
    tertiary: 'bg-transparent text-inherit hover:bg-black/5 focus:ring-gray-400 dark:hover:bg-white/10',
  }

  return cn(base, variants[variant])
}

export function Banner({
  title,
  description,
  eyebrow,
  icon: Icon,
  ctaLabel,
  ctaHref,
  onCtaClick,
  ctaVariant = 'primary',
  secondaryAction,
  variant = 'default',
  backgroundImageSrc,
  backgroundImageAlt = '',
  dismissible = false,
  onDismiss,
  className,
  children,
  ...props
}: BannerProps) {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) {
    return null
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border shadow-sm',
        'transition-all duration-200',
        bannerVariantStyles[variant],
        className
      )}
      {...props}
    >
      {backgroundImageSrc ? (
        <>
          <div className="absolute inset-0 opacity-20" aria-hidden="true">
            <Image src={backgroundImageSrc} alt={backgroundImageAlt} fill sizes="100vw" className="object-cover" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/90 to-white/80 dark:from-neutral-900/95 dark:via-neutral-900/90 dark:to-neutral-900/75" aria-hidden="true" />
        </>
      ) : null}

      <div className="relative px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            {Icon ? (
              <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/80 text-primary shadow-sm ring-1 ring-black/5 dark:bg-neutral-800 dark:text-primary">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
            ) : null}

            <div className="min-w-0 space-y-1">
              {eyebrow ? (
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-neutral-400">
                  {eyebrow}
                </p>
              ) : null}
              <p className="text-base font-semibold leading-6 sm:text-lg">{title}</p>
              {description ? (
                <p className="text-sm leading-6 text-gray-600 dark:text-neutral-300">{description}</p>
              ) : null}
              {children}
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
            {ctaLabel && ctaHref ? (
              <Link href={ctaHref} className={bannerCtaLinkClasses(ctaVariant)}>
                {ctaLabel}
              </Link>
            ) : null}

            {ctaLabel && !ctaHref ? (
              <Button size="small" variant={ctaVariant} onClick={onCtaClick}>
                {ctaLabel}
              </Button>
            ) : null}

            {secondaryAction}

            {dismissible ? (
              <button
                type="button"
                aria-label="Dismiss banner"
                onClick={() => {
                  setIsVisible(false)
                  onDismiss?.()
                }}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-black/5 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary dark:text-neutral-300 dark:hover:bg-white/10 dark:hover:text-white"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

