import * as React from "react"

import { cn } from "@/lib/utils"

const PricingCard = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className,
    )}
    {...props}
  />
))
PricingCard.displayName = "PricingCard"

const PricingCardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
PricingCardHeader.displayName = "PricingCardHeader"

const PricingCardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className,
    )}
    {...props}
  />
))
PricingCardTitle.displayName = "PricingCardTitle"

const PricingCardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
PricingCardDescription.displayName = "PricingCardDescription"

const PricingCardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
PricingCardContent.displayName = "PricingCardContent"

const PricingCardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
PricingCardFooter.displayName = "PricingCardFooter"

export { PricingCard, PricingCardHeader, PricingCardFooter, PricingCardTitle, PricingCardDescription, PricingCardContent }
