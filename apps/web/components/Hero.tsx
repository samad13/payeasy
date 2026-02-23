'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button, type ButtonVariant } from './Button'
import { cn } from '@/lib/utils'

export type HeroHeight = 'sm' | 'md' | 'lg' | 'screen'
export type HeroAlign = 'left' | 'center' | 'right'

export interface HeroProps extends React.HTMLAttributes<HTMLElement> {
  title: React.ReactNode
  subtitle?: React.ReactNode
  eyebrow?: React.ReactNode
  ctaLabel?: string
  ctaHref?: string
  onCtaClick?: () => void
  ctaVariant?: ButtonVariant
  ctaTarget?: React.AnchorHTMLAttributes<HTMLAnchorElement>['target']
  ctaRel?: React.AnchorHTMLAttributes<HTMLAnchorElement>['rel']
  secondaryAction?: React.ReactNode
  backgroundImageSrc?: string
  backgroundImageAlt?: string
  backgroundVideoSrc?: string
  backgroundVideoPoster?: string
  backgroundVideoType?: string
  overlayClassName?: string
  contentClassName?: string
  mediaClassName?: string
  height?: HeroHeight
  align?: HeroAlign
  priorityImage?: boolean
  videoAutoPlay?: boolean
  videoLoop?: boolean
  videoMuted?: boolean
  videoControls?: boolean
}

const heroHeightStyles: Record<HeroHeight, string> = {
  sm: 'min-h-[22rem] sm:min-h-[26rem]',
  md: 'min-h-[26rem] sm:min-h-[32rem]',
  lg: 'min-h-[32rem] sm:min-h-[38rem]',
  screen: 'min-h-[70vh] sm:min-h-[80vh]',
}

const heroAlignmentStyles: Record<HeroAlign, string> = {
  left: 'text-left items-start',
  center: 'text-center items-center',
  right: 'text-right items-end',
}

function ctaLinkClasses(variant: ButtonVariant) {
  const base =
    'inline-flex min-h-[44px] items-center justify-center rounded-lg px-4 py-2 text-base font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98]'

  const variants: Record<ButtonVariant, string> = {
    primary:
      'bg-primary text-white shadow-sm hover:bg-primary/90 hover:shadow-md active:bg-primary/80 focus:ring-primary focus:ring-offset-white/30',
    secondary:
      'bg-white/90 text-gray-900 shadow-sm hover:bg-white hover:shadow-md focus:ring-white/60',
    tertiary:
      'border border-white/30 bg-white/5 text-white backdrop-blur-sm hover:bg-white/10 focus:ring-white/60',
  }

  return cn(base, variants[variant])
}

export function Hero({
  title,
  subtitle,
  eyebrow,
  ctaLabel,
  ctaHref,
  onCtaClick,
  ctaVariant = 'primary',
  ctaTarget,
  ctaRel,
  secondaryAction,
  backgroundImageSrc,
  backgroundImageAlt = '',
  backgroundVideoSrc,
  backgroundVideoPoster,
  backgroundVideoType = 'video/mp4',
  overlayClassName,
  contentClassName,
  mediaClassName,
  height = 'lg',
  align = 'left',
  priorityImage = false,
  videoAutoPlay = true,
  videoLoop = true,
  videoMuted = true,
  videoControls = false,
  className,
  children,
  ...props
}: HeroProps) {
  const showMedia = Boolean(backgroundImageSrc || backgroundVideoSrc)

  return (
    <section
      className={cn(
        'relative isolate overflow-hidden rounded-2xl border border-white/10 bg-slate-950 text-white shadow-2xl',
        heroHeightStyles[height],
        className
      )}
      {...props}
    >
      {showMedia ? (
        <div className={cn('absolute inset-0 -z-20', mediaClassName)} aria-hidden="true">
          {backgroundImageSrc ? (
            <Image
              src={backgroundImageSrc}
              alt={backgroundImageAlt}
              fill
              priority={priorityImage}
              sizes="100vw"
              className="object-cover"
            />
          ) : null}

          {backgroundVideoSrc ? (
            <video
              className="absolute inset-0 h-full w-full object-cover"
              autoPlay={videoAutoPlay}
              loop={videoLoop}
              muted={videoMuted}
              controls={videoControls}
              playsInline
              preload="metadata"
              poster={backgroundVideoPoster}
            >
              <source src={backgroundVideoSrc} type={backgroundVideoType} />
            </video>
          ) : null}
        </div>
      ) : (
        <div
          className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.25),transparent_45%),radial-gradient(circle_at_80%_20%,rgba(99,102,241,0.18),transparent_50%),linear-gradient(180deg,#020617_0%,#0f172a_100%)]"
          aria-hidden="true"
        />
      )}

      <div
        className={cn(
          'absolute inset-0 -z-10 bg-gradient-to-br from-slate-950/85 via-slate-900/70 to-slate-900/90',
          'sm:bg-gradient-to-r sm:from-slate-950/85 sm:via-slate-900/65 sm:to-slate-950/75',
          overlayClassName
        )}
        aria-hidden="true"
      />

      <div className="relative flex h-full w-full items-stretch px-5 py-8 sm:px-8 sm:py-10 lg:px-12">
        <div
          className={cn(
            'flex w-full max-w-3xl flex-col justify-center gap-5 sm:gap-6',
            heroAlignmentStyles[align],
            contentClassName
          )}
        >
          {eyebrow ? (
            <div className="inline-flex w-fit max-w-full items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-white/90 backdrop-blur-sm">
              {eyebrow}
            </div>
          ) : null}

          <div className="space-y-3 sm:space-y-4">
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl xl:text-6xl">
              {title}
            </h1>
            {subtitle ? (
              <p className="max-w-2xl text-sm leading-6 text-slate-100/90 sm:text-base sm:leading-7 lg:text-lg">
                {subtitle}
              </p>
            ) : null}
          </div>

          {(ctaLabel || secondaryAction) && (
            <div
              className={cn(
                'flex flex-wrap items-center gap-3',
                align === 'center' && 'justify-center',
                align === 'right' && 'justify-end'
              )}
            >
              {ctaLabel && ctaHref ? (
                <Link href={ctaHref} target={ctaTarget} rel={ctaRel} className={ctaLinkClasses(ctaVariant)}>
                  {ctaLabel}
                </Link>
              ) : null}

              {ctaLabel && !ctaHref ? (
                <Button variant={ctaVariant} onClick={onCtaClick} className="shadow-sm">
                  {ctaLabel}
                </Button>
              ) : null}

              {secondaryAction}
            </div>
          )}

          {children ? <div>{children}</div> : null}
        </div>
      </div>
    </section>
  )
}

