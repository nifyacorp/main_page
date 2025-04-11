import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-md border border-border/60 p-3.5 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-3.5 [&>svg]:top-3.5 [&>svg]:text-foreground/80",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/30 bg-destructive/5 text-destructive dark:border-destructive/30 [&>svg]:text-destructive/80",
        success: 
          "border-green-500/30 bg-green-50 text-green-700 dark:bg-green-900/10 dark:text-green-400 dark:border-green-500/30 [&>svg]:text-green-500/80",
        info:
          "border-blue-500/30 bg-blue-50 text-blue-700 dark:bg-blue-900/10 dark:text-blue-400 dark:border-blue-500/30 [&>svg]:text-blue-500/80",
        warning:
          "border-yellow-500/30 bg-yellow-50 text-yellow-700 dark:bg-yellow-900/10 dark:text-yellow-400 dark:border-yellow-500/30 [&>svg]:text-yellow-500/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight text-foreground", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed text-foreground/80", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }