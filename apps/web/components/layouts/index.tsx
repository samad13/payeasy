import React from 'react'
import { cn } from '@/lib/utils'

export type ContainerWidth = 'narrow' | 'default' | 'wide' | 'full'
export type SectionSpacing = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type LayoutGap = 'sm' | 'md' | 'lg' | 'xl'

type SemanticContainerTag = 'div' | 'section' | 'main' | 'article' | 'header' | 'footer' | 'aside' | 'nav'

export const CONTAINER_WIDTH_CLASSES: Record<ContainerWidth, string> = {
  narrow: 'max-w-3xl',
  default: 'max-w-5xl',
  wide: 'max-w-7xl',
  full: 'max-w-none',
}

export const SECTION_SPACING_CLASSES: Record<SectionSpacing, string> = {
  none: 'py-0',
  xs: 'py-4 sm:py-6',
  sm: 'py-6 sm:py-8',
  md: 'py-8 sm:py-12',
  lg: 'py-12 sm:py-16',
  xl: 'py-16 sm:py-24',
}

const GAP_CLASSES: Record<LayoutGap, string> = {
  sm: 'gap-4',
  md: 'gap-6',
  lg: 'gap-8',
  xl: 'gap-10',
}

export interface ContainerProps extends React.HTMLAttributes<HTMLElement> {
  as?: SemanticContainerTag
  width?: ContainerWidth
  paddingX?: boolean
}

export function Container({
  as = 'div',
  width = 'wide',
  paddingX = true,
  className,
  children,
  ...props
}: ContainerProps) {
  const Component = as
  return (
    <Component
      className={cn(
        'mx-auto w-full',
        CONTAINER_WIDTH_CLASSES[width],
        paddingX && 'px-4 sm:px-6 lg:px-8',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  )
}

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  as?: SemanticContainerTag
  spacing?: SectionSpacing
  containerWidth?: ContainerWidth
  withContainer?: boolean
  containerClassName?: string
}

export function Section({
  as = 'section',
  spacing = 'lg',
  containerWidth = 'wide',
  withContainer = true,
  containerClassName,
  className,
  children,
  ...props
}: SectionProps) {
  const Component = as

  return (
    <Component className={cn(SECTION_SPACING_CLASSES[spacing], className)} {...props}>
      {withContainer ? (
        <Container width={containerWidth} className={containerClassName}>
          {children}
        </Container>
      ) : (
        children
      )}
    </Component>
  )
}

export type TwoColumnSplit = 'equal' | 'content-main' | 'main-content'

export interface TwoColumnLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  left: React.ReactNode
  right: React.ReactNode
  split?: TwoColumnSplit
  gap?: LayoutGap
  reverseOnMobile?: boolean
  align?: 'start' | 'center' | 'end'
}

const twoColumnSplitClasses: Record<TwoColumnSplit, string> = {
  equal: 'lg:grid-cols-2',
  'content-main': 'lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]',
  'main-content': 'lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]',
}

const alignItemsClasses = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
} as const

export function TwoColumnLayout({
  left,
  right,
  split = 'equal',
  gap = 'lg',
  reverseOnMobile = false,
  align = 'start',
  className,
  ...props
}: TwoColumnLayoutProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-1',
        twoColumnSplitClasses[split],
        GAP_CLASSES[gap],
        alignItemsClasses[align],
        className
      )}
      {...props}
    >
      <div className={cn(reverseOnMobile && 'order-2 lg:order-1')}>{left}</div>
      <div className={cn(reverseOnMobile && 'order-1 lg:order-2')}>{right}</div>
    </div>
  )
}

export type ThreeColumnDistribution = 'equal' | 'feature-first' | 'feature-middle'

export interface ThreeColumnLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  first: React.ReactNode
  second: React.ReactNode
  third: React.ReactNode
  distribution?: ThreeColumnDistribution
  gap?: LayoutGap
  align?: 'start' | 'center' | 'end'
}

const threeColumnDistributionClasses: Record<ThreeColumnDistribution, string> = {
  equal: 'xl:grid-cols-3 md:grid-cols-2 grid-cols-1',
  'feature-first': 'xl:grid-cols-[1.25fr_1fr_1fr] md:grid-cols-2 grid-cols-1',
  'feature-middle': 'xl:grid-cols-[1fr_1.25fr_1fr] md:grid-cols-2 grid-cols-1',
}

export function ThreeColumnLayout({
  first,
  second,
  third,
  distribution = 'equal',
  gap = 'lg',
  align = 'start',
  className,
  ...props
}: ThreeColumnLayoutProps) {
  return (
    <div
      className={cn(
        'grid',
        threeColumnDistributionClasses[distribution],
        GAP_CLASSES[gap],
        alignItemsClasses[align],
        className
      )}
      {...props}
    >
      <div>{first}</div>
      <div>{second}</div>
      <div className={cn(distribution !== 'equal' && 'md:col-span-2 xl:col-span-1')}>{third}</div>
    </div>
  )
}

export type SidebarWidth = 'sm' | 'md' | 'lg'

export interface SidebarLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  sidebar: React.ReactNode
  children: React.ReactNode
  sidebarPosition?: 'left' | 'right'
  sidebarWidth?: SidebarWidth
  gap?: LayoutGap
  stickySidebar?: boolean
}

const sidebarWidthClasses: Record<SidebarWidth, string> = {
  sm: 'lg:grid-cols-[16rem_minmax(0,1fr)]',
  md: 'lg:grid-cols-[20rem_minmax(0,1fr)]',
  lg: 'lg:grid-cols-[24rem_minmax(0,1fr)]',
}

export function SidebarLayout({
  sidebar,
  children,
  sidebarPosition = 'left',
  sidebarWidth = 'md',
  gap = 'lg',
  stickySidebar = false,
  className,
  ...props
}: SidebarLayoutProps) {
  const sidebarNode = (
    <aside className={cn(stickySidebar && 'lg:sticky lg:top-6 lg:self-start')}>{sidebar}</aside>
  )

  const mainNode = <div>{children}</div>

  return (
    <div
      className={cn(
        'grid grid-cols-1 items-start',
        sidebarWidthClasses[sidebarWidth],
        GAP_CLASSES[gap],
        className
      )}
      {...props}
    >
      {sidebarPosition === 'left' ? sidebarNode : mainNode}
      {sidebarPosition === 'left' ? mainNode : sidebarNode}
    </div>
  )
}

export type GridTemplate = 'auto' | 'cards-2' | 'cards-3' | 'cards-4'

export interface GridLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  template?: GridTemplate
  gap?: LayoutGap
}

const gridTemplateClasses: Record<GridTemplate, string> = {
  auto: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  'cards-2': 'grid-cols-1 md:grid-cols-2',
  'cards-3': 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3',
  'cards-4': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
}

export function GridLayout({
  children,
  template = 'auto',
  gap = 'lg',
  className,
  ...props
}: GridLayoutProps) {
  return (
    <div className={cn('grid', gridTemplateClasses[template], GAP_CLASSES[gap], className)} {...props}>
      {children}
    </div>
  )
}
