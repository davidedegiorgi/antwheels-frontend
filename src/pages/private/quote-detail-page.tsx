import { Button } from "@/components/ui/button"
import PageLoader from "@/components/page-loader"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { QuotesService } from "@/features/quotes/quotes.service"
import { formatPrice } from "@/lib/utils"
import { useMutation, useQuery } from "@tanstack/react-query"
import { Download } from "lucide-react"
import { Link, useParams } from "react-router"
import { toast } from "sonner"


const MODEL_DISPLAY_NAMES: Record<string, string> = {
  Strada: "Strada",
  Gravel: "Gravel",
  MTB: "MTB",
}

function getWheelCategoryDisplayName(modelName?: string) {
  if (!modelName) return "Ruote"
  return MODEL_DISPLAY_NAMES[modelName] ?? modelName
}

function formatComponentName(name: string) {
  return name.replace(/^Profilo\s+/i, "").replace(/\s+mm/gi, "mm")
}

function isProfileComponent(component: { name: string; category: string }) {
  return component.category.toLowerCase() === "profilo" || component.name.toLowerCase().includes("profilo")
}

function isSpokeComponent(component: { name: string; category: string }) {
  const name = component.name.toLowerCase()
  return name.includes("sapim") || name.includes("raggi") || name.includes("berd")
}

export default function QuoteDetailPage() {
  const { id } = useParams<{ id: string }>()
  const quoteId = Number(id)

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["quote", quoteId],
    queryFn: () => QuotesService.get(quoteId),
    enabled: Number.isFinite(quoteId),
  })

  const exportPdfMutation = useMutation({
    mutationFn: () => QuotesService.exportPdf(quoteId),
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `preventivo_${quoteId}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      toast.success("PDF scaricato")
      refetch()
    },
    onError: () => toast.error("Errore export PDF"),
  })

  if (isLoading) return <PageLoader />
  if (!data) return <p>Preventivo non trovato</p>

  const { quote, details } = data
  const surchargeAmount = Number(details.total) - Number(details.total) / 1.12
  const profile = details.components.find(isProfileComponent)
  const spokeComponent = details.components.find(isSpokeComponent)
  const otherComponents = details.components.filter(
    (component) => !isProfileComponent(component) && !isSpokeComponent(component)
  )
  const componentRows = [
    profile
      ? {
          label: "Profilo",
          name: formatComponentName(profile.name),
          price: profile.price,
        }
      : null,
    {
      label: "Mozzo",
      name: details.wheel_hub.name,
      price: details.wheel_hub.price,
    },
    spokeComponent
      ? {
          label: "Raggi",
          name: spokeComponent.name,
          price: spokeComponent.price,
          meta:
            spokeComponent.unit_price && spokeComponent.spoke_count
              ? `${formatPrice(spokeComponent.unit_price)} cad. x ${spokeComponent.spoke_count} pz`
              : undefined,
        }
      : null,
    ...otherComponents.map((component) => ({
      label: "Componente",
      name: component.name,
      price: component.price,
    })),
  ].filter((row): row is { label: string; name: string; price: string | number; meta?: string } => Boolean(row))

  return (
    <div>
      <Button variant="ghost" size="sm" render={<Link to="/area-personale/configurazioni" />}>
        ← Configurazioni
      </Button>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light">Preventivo #{quote.id}</h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant="accent"
            onClick={() => exportPdfMutation.mutate()}
            disabled={exportPdfMutation.isPending}
          >
            <Download />
            Scarica PDF
          </Button>
        </div>
      </div>

      <Card className="mt-8 overflow-hidden border-white/10 bg-white/[0.03]">
        <CardHeader className="border-b border-white/10 pb-6">
          <CardTitle className="text-3xl font-semibold tracking-tight">
            {getWheelCategoryDisplayName(details.wheel_category.name)}
          </CardTitle>
          <CardDescription>Riepilogo componenti selezionati</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="grid gap-4 pt-2">
            {componentRows.map((component) => (
              <div
                key={`${component.label}-${component.name}`}
                className="grid gap-3 rounded-lg border border-white/10 bg-background/70 p-4 sm:grid-cols-[8rem_minmax(0,1fr)_auto] sm:items-center"
              >
                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {component.label}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-medium">{component.name}</p>
                  {component.meta && (
                    <p className="mt-1 text-xs text-muted-foreground">{component.meta}</p>
                  )}
                </div>
                <span className="font-medium">{formatPrice(component.price)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>12% maggiorazione</span>
            <span>{formatPrice(surchargeAmount)}</span>
          </div>
          <div className="flex justify-between border-t border-white/10 pt-5 text-xl font-semibold">
            <span>Totale</span>
            <span>{formatPrice(details.total)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
