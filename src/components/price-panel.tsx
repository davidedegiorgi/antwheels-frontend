import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/utils"
import { ChevronRight } from "lucide-react"

type PriceLine = { label: string; value: number }

type PricePanelProps = {
  lines: PriceLine[]
  total: number
  actionLabel?: string
  onAction?: () => void
  actionDisabled?: boolean
}

export default function PricePanel({
  lines,
  total,
  actionLabel,
  onAction,
  actionDisabled,
}: PricePanelProps) {
  return (
    <aside className="sticky top-20 rounded-xl border bg-card p-4 shadow-lg">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Il tuo preventivo
      </p>
      <p className="mt-1 text-2xl font-light tracking-tight">{formatPrice(total)}</p>
      {lines.length > 0 && (
        <ul className="mt-4 space-y-2 text-sm">
          {lines.map((line) => (
            <li key={line.label} className="flex justify-between gap-4">
              <span className="text-muted-foreground">{line.label}</span>
              <span>{formatPrice(line.value)}</span>
            </li>
          ))}
        </ul>
      )}
      {actionLabel && onAction && (
        <Button
          className="mt-4 w-full"
          variant="accent"
          size="lg"
          onClick={onAction}
          disabled={actionDisabled}
        >
          {actionLabel}
          <ChevronRight />
        </Button>
      )}
    </aside>
  )
}
