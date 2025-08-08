"use client"

import { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Breadcrumb } from "./breadcrumb"

interface PageContainerProps {
  children: ReactNode
  title?: string
  description?: string
  breadcrumbs?: Array<{ label: string; href?: string; active?: boolean }>
  className?: string
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"
  padding?: "none" | "sm" | "md" | "lg"
  onBreadcrumbNavigate?: (href: string) => void
}

const maxWidthClasses = {
  sm: "max-w-3xl",
  md: "max-w-5xl", 
  lg: "max-w-6xl",
  xl: "max-w-7xl",
  "2xl": "max-w-screen-2xl",
  full: "max-w-none"
}

const paddingClasses = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8"
}

export function PageContainer({
  children,
  title,
  description,
  breadcrumbs,
  className,
  maxWidth = "xl",
  padding = "md",
  onBreadcrumbNavigate
}: PageContainerProps) {
  return (
    <div className={cn(
      "w-full mx-auto space-y-6",
      maxWidthClasses[maxWidth],
      paddingClasses[padding],
      className
    )}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb items={breadcrumbs} onNavigate={onBreadcrumbNavigate} />
      )}
      
      {/* Page Header */}
      {(title || description) && (
        <div className="space-y-2">
          {title && (
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              {title}
            </h1>
          )}
          {description && (
            <p className="text-muted-foreground text-sm sm:text-base max-w-3xl">
              {description}
            </p>
          )}
        </div>
      )}
      
      {/* Content */}
      <div className="space-y-6">
        {children}
      </div>
    </div>
  )
}