import { Button } from "@/components/ui/button"
import PageLoader from "@/components/page-loader"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ConfigurationsService } from "@/features/configurations/configurations.service"
import { QuotesService } from "@/features/quotes/quotes.service"
import type { Quote, QuoteResponse } from "@/features/quotes/quotes.type"
import { formatPrice } from "@/lib/utils"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Eye, GitCompareArrows, Pencil, Settings2 } from "lucide-react"
import { useMemo, useState } from "react"
import { Link, useNavigate } from "react-router"
import { toast } from "sonner"

export default function AreaPersonalePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [openingConfigId, setOpeningConfigId] = useState<number | null>(null)

  const { data: configs, isLoading: loadingConfigs } = useQuery({
    queryKey: ["configurations"],
    queryFn: ConfigurationsService.list,
  })

  const { data: quotes, isLoading: loadingQuotes } = useQuery({
    queryKey: ["quotes"],
    queryFn: QuotesService.list,
  })

  const normalizedQuotes = useMemo(
    () => quotes?.map(getQuoteFromListEntry).filter((q): q is Quote => !!q) ?? [],
    [quotes]
  )

  const openQuoteMutation = useMutation({
    mutationFn: async (configurationId: number) => {
      const existingQuote = normalizedQuotes.find(
        (quote) => quote.configuration_id === configurationId
      )
      if (existingQuote) return existingQuote.id

      const createdQuote = await QuotesService.create(configurationId)
      return createdQuote.quote.id
    },
    onMutate: (configurationId) => {
      setOpeningConfigId(configurationId)
    },
    onSuccess: (quoteId) => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] })
      navigate(`/area-personale/preventivi/${quoteId}`)
    },
    onError: () => {
      toast.error("Errore nell'apertura del preventivo")
    },
    onSettled: () => {
      setOpeningConfigId(null)
    },
  })

  return (
    <div>
      <h1 className="text-3xl font-light">Configurazioni</h1>
      <p className="mt-2 text-muted-foreground">Le tue configurazioni salvate.</p>

      <div className="mt-10">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-xl font-medium">
              <Settings2 className="size-5" />
              Configurazioni
            </h2>
            <div className="flex gap-2">
              {configs && configs.length >= 2 ? (
                <Button
                  size="sm"
                  variant="outline"
                  render={<Link to="/area-personale/configurazioni/confronta" />}
                >
                  <GitCompareArrows />
                  Confronta
                </Button>
              ) : (
                <Button size="sm" variant="outline" disabled>
                  <GitCompareArrows />
                  Confronta
                </Button>
              )}
              <Button size="sm" render={<Link to="/configura" />}>
                Nuova
              </Button>
            </div>
          </div>
          {loadingConfigs ? (
            <PageLoader />
          ) : configs?.length ? (
            <ul className="grid gap-4 lg:grid-cols-2">
              {configs.map((c) => {
                const linkedQuote = normalizedQuotes.find(
                  (quote) => quote.configuration_id === c.id
                )
                const isOpening =
                  loadingQuotes ||
                  (openingConfigId === c.id && openQuoteMutation.isPending)

                return (
                <li key={c.id}>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        {c.name ?? `Config #${c.id}`}
                      </CardTitle>
                      <CardDescription>
                        {c.wheel_category?.name ?? "Categoria"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between gap-4">
                      <span className="font-medium">
                        {formatPrice(c.total_price)}
                      </span>
                      <div className="flex shrink-0 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isOpening}
                          onClick={() => openQuoteMutation.mutate(c.id)}
                        >
                          <Eye />
                          {loadingQuotes ? "..." : isOpening ? "Apro..." : linkedQuote ? "Vedi" : "Genera"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          render={<Link to={`/area-personale/configurazioni/${c.id}`} />}
                        >
                          <Pencil />
                          Modifica
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </li>
                )
              })}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              Nessuna configurazione salvata.
            </p>
          )}
        </section>
      </div>
    </div>
  )
}

function getQuoteFromListEntry(entry: unknown): Quote | undefined {
  if (!entry || typeof entry !== "object") return undefined

  const value = entry as Partial<QuoteResponse> & Partial<Quote>
  if (value.quote?.id) return value.quote
  if (value.id && value.configuration_id) return value as Quote

  return undefined
}
