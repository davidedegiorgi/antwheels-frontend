import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

function Field({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-2", className)} {...props} />
}

function FieldLabel({ className, ...props }: React.ComponentProps<typeof Label>) {
  return <Label className={className} {...props} />
}

function FieldError({ className, children, ...props }: React.ComponentProps<"p">) {
  if (!children) return null
  return (
    <p className={cn("text-sm text-destructive", className)} {...props}>
      {children}
    </p>
  )
}

export { Field, FieldLabel, FieldError }
