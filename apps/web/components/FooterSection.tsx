import React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export interface FooterLinkItem {
  label: string
  href: string
  external?: boolean
  ariaLabel?: string
}

export interface FooterSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title: React.ReactNode
  description?: React.ReactNode
  links?: FooterLinkItem[]
  listClassName?: string
}

export function FooterSection({
  title,
  description,
  links = [],
  className,
  listClassName,
  children,
  ...props
}: FooterSectionProps) {
  return (
    <div className={cn('space-y-3', className)} {...props}>
      <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-gray-900 dark:text-white">{title}</h3>

      {description ? <p className="text-sm leading-6 text-gray-600 dark:text-neutral-300">{description}</p> : null}

      {links.length > 0 ? (
        <ul className={cn('space-y-2', listClassName)}>
          {links.map((link) => (
            <li key={`${link.href}-${link.label}`}>
              <Link
                href={link.href}
                aria-label={link.ariaLabel}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noopener noreferrer' : undefined}
                className="text-sm text-gray-600 transition-colors hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:text-neutral-300 dark:hover:text-primary"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}

      {children}
    </div>
  )
}

