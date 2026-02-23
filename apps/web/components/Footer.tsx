'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Facebook, Github, Instagram, Linkedin, Mail, Send, Twitter } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button } from './Button'
import { FooterSection, type FooterLinkItem } from './FooterSection'
import { cn } from '@/lib/utils'

export interface FooterLinkGroup {
  title: string
  links: FooterLinkItem[]
}

export interface FooterSocialLink extends FooterLinkItem {
  icon: LucideIcon
}

type NewsletterState = 'idle' | 'submitting' | 'success' | 'error'

export interface FooterProps extends React.HTMLAttributes<HTMLElement> {
  companyName?: string
  companyDescription?: string
  logo?: React.ReactNode
  navigationSections?: FooterLinkGroup[]
  socialLinks?: FooterSocialLink[]
  legalLinks?: FooterLinkItem[]
  showNewsletter?: boolean
  newsletterTitle?: string
  newsletterDescription?: string
  newsletterPlaceholder?: string
  newsletterAction?: string
  newsletterMethod?: 'get' | 'post'
  onNewsletterSubmit?: (email: string) => void | Promise<void>
  sticky?: boolean
  copyrightText?: string
}

const defaultNavigationSections: FooterLinkGroup[] = [
  {
    title: 'Product',
    links: [
      { label: 'Browse Listings', href: '/browse' },
      { label: 'Payments', href: '/payments/history' },
      { label: 'Dashboard', href: '/dashboard' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/' },
      { label: 'Contact', href: '/message/1' },
      { label: 'Privacy', href: '/privacy' },
    ],
  },
]

const defaultSocialLinks: FooterSocialLink[] = [
  { label: 'X / Twitter', href: 'https://twitter.com', external: true, icon: Twitter },
  { label: 'LinkedIn', href: 'https://linkedin.com', external: true, icon: Linkedin },
  { label: 'GitHub', href: 'https://github.com', external: true, icon: Github },
  { label: 'Instagram', href: 'https://instagram.com', external: true, icon: Instagram },
  { label: 'Facebook', href: 'https://facebook.com', external: true, icon: Facebook },
]

const defaultLegalLinks: FooterLinkItem[] = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms', href: '/#terms' },
  { label: 'Cookies', href: '/#cookies' },
]

export function Footer({
  companyName = 'PayEasy',
  companyDescription = 'Secure payments and renter workflows built for modern housing experiences.',
  logo,
  navigationSections = defaultNavigationSections,
  socialLinks = defaultSocialLinks,
  legalLinks = defaultLegalLinks,
  showNewsletter = true,
  newsletterTitle = 'Stay in the loop',
  newsletterDescription = 'Get product updates, launch news, and payment tips in your inbox.',
  newsletterPlaceholder = 'Enter your email',
  newsletterAction,
  newsletterMethod = 'post',
  onNewsletterSubmit,
  sticky = false,
  copyrightText,
  className,
  ...props
}: FooterProps) {
  const [email, setEmail] = useState('')
  const [newsletterState, setNewsletterState] = useState<NewsletterState>('idle')
  const [newsletterMessage, setNewsletterMessage] = useState<string | null>(null)

  const shouldInterceptSubmit = Boolean(onNewsletterSubmit) || !newsletterAction

  const handleNewsletterSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    if (shouldInterceptSubmit) {
      event.preventDefault()
    }

    if (!shouldInterceptSubmit) {
      return
    }

    const normalized = email.trim()
    if (!normalized) {
      setNewsletterState('error')
      setNewsletterMessage('Please enter a valid email address.')
      return
    }

    setNewsletterState('submitting')
    setNewsletterMessage(null)

    try {
      if (onNewsletterSubmit) {
        await onNewsletterSubmit(normalized)
      }

      setNewsletterState('success')
      setNewsletterMessage('Thanks for subscribing.')
      setEmail('')
    } catch (error) {
      setNewsletterState('error')
      setNewsletterMessage(error instanceof Error ? error.message : 'Subscription failed. Try again.')
    }
  }

  const year = new Date().getFullYear()

  return (
    <footer
      className={cn(
        'border-t border-gray-200 bg-white text-gray-900 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white',
        sticky && 'mt-auto',
        className
      )}
      {...props}
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-4">
            <div className="flex items-center gap-3">
              {logo ? (
                <div className="shrink-0">{logo}</div>
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Send className="h-5 w-5" aria-hidden="true" />
                </div>
              )}
              <div>
                <p className="text-base font-semibold">{companyName}</p>
                <p className="text-sm text-gray-600 dark:text-neutral-400">Fast, secure, reliable</p>
              </div>
            </div>

            <p className="max-w-md text-sm leading-6 text-gray-600 dark:text-neutral-300">{companyDescription}</p>

            <div className="flex flex-wrap items-center gap-2">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <Link
                    key={`${social.href}-${social.label}`}
                    href={social.href}
                    target={social.external ? '_blank' : undefined}
                    rel={social.external ? 'noopener noreferrer' : undefined}
                    aria-label={social.ariaLabel ?? social.label}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition-colors hover:border-primary/40 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-primary/40"
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:col-span-4">
            {navigationSections.map((section) => (
              <FooterSection key={section.title} title={section.title} links={section.links} />
            ))}
          </div>

          {showNewsletter ? (
            <FooterSection
              title={newsletterTitle}
              description={newsletterDescription}
              className="lg:col-span-4"
            >
              <form
                action={newsletterAction}
                method={newsletterMethod}
                onSubmit={handleNewsletterSubmit}
                className="space-y-3"
              >
                <label htmlFor="footer-newsletter-email" className="sr-only">
                  Email address
                </label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="relative flex-1">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                    <input
                      id="footer-newsletter-email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      inputMode="email"
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value)
                        if (newsletterState !== 'idle') {
                          setNewsletterState('idle')
                          setNewsletterMessage(null)
                        }
                      }}
                      placeholder={newsletterPlaceholder}
                      className="h-11 w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm outline-none ring-0 transition focus:border-primary focus:ring-2 focus:ring-primary/30 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-500"
                    />
                  </div>
                  <Button
                    type="submit"
                    size="small"
                    isLoading={newsletterState === 'submitting'}
                    className="h-11 min-w-[120px]"
                  >
                    Subscribe
                  </Button>
                </div>

                {newsletterMessage ? (
                  <p
                    role={newsletterState === 'error' ? 'alert' : 'status'}
                    className={cn(
                      'text-sm',
                      newsletterState === 'error'
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-green-700 dark:text-green-400'
                    )}
                  >
                    {newsletterMessage}
                  </p>
                ) : null}
              </form>
            </FooterSection>
          ) : null}
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-gray-200 pt-6 text-sm text-gray-600 dark:border-neutral-800 dark:text-neutral-400 sm:flex-row sm:items-center sm:justify-between">
          <p>{copyrightText ?? `© ${year} ${companyName}. All rights reserved.`}</p>

          <nav aria-label="Legal links" className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {legalLinks.map((link) => (
              <Link
                key={`${link.href}-${link.label}`}
                href={link.href}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noopener noreferrer' : undefined}
                className="transition-colors hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  )
}
