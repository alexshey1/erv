"use client"

import { ChevronRight, Home } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BreadcrumbItem {
  label: string
  href?: string
  active?: boolean
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  onNavigate?: (href: string) => void
}

export function Breadcrumb({ items, onNavigate }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center space-x-1 text-sm text-muted-foreground">
      <Button
        variant="ghost"
        size="sm"
        className="h-auto p-1 hover:bg-transparent"
        onClick={() => onNavigate?.("dashboard")}
      >
        <Home className="h-4 w-4" />
      </Button>
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-1">
          <ChevronRight className="h-4 w-4" />
          {item.href && !item.active ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-1 hover:bg-transparent text-muted-foreground hover:text-foreground"
              onClick={() => onNavigate?.(item.href!)}
            >
              {item.label}
            </Button>
          ) : (
            <span className={item.active ? "text-foreground font-medium" : "text-muted-foreground"}>
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  )
}