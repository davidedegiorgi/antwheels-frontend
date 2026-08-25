import ModelCard from "@/components/model-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { WHEEL_MODEL_ASSETS } from "@/data/wheel-brand"
import { useAuthStore } from "@/features/auth/auth.store"
import { ConfigurationsService } from "@/features/configurations/configurations.service"
import { formatPrice } from "@/lib/utils"
import { useQuery } from "@tanstack/react-query"
import { ArrowRight } from "lucide-react"
import { Link } from "react-router"

export default function HomePage() {
  const token = useAuthStore((state) => state.token)
  const models = STATIC_WHEEL_MODELS
  const { data: configurations, isLoading: configurationsLoading } = useQuery({
    queryKey: ["configurations"],
    queryFn: ConfigurationsService.list,
    enabled: Boolean(token),
  })

  const recentConfigurations = [...(configurations ?? [])]
    .sort((a, b) => {
      const aDate = new Date(a.updated_at ?? a.created_at ?? 0).getTime()
      const bDate = new Date(b.updated_at ?? b.created_at ?? 0).getTime()
      return bDate - aDate
    })
    .slice(0, 2)

  return (
    <div className="space-y-14 pt-2">
      <section id="ruote" className="space-y-5">
        <div className="grid gap-5 md:grid-cols-3 lg:gap-6">
          {models.map((model) => {
            const asset = WHEEL_MODEL_ASSETS[model.name]
            if (!asset) return null
            return <ModelCard key={model.id} model={model} asset={asset} />
          })}
        </div>
      </section>

      {token && (
        <section className="space-y-5 border-t border-white/10 pt-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-medium tracking-tight">Ultime configurazioni</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Le ultime due configurazioni salvate.
              </p>
            </div>
            <Button variant="ghost" className="rounded-full" render={<Link to="/area-personale/configurazioni" />}>
              Tutte
              <ArrowRight />
            </Button>
          </div>

          {configurationsLoading ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {[1, 2].map((item) => (
                <Skeleton key={item} className="h-36 w-full rounded-xl" />
              ))}
            </div>
          ) : recentConfigurations.length ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {recentConfigurations.map((configuration) => (
                <Card key={configuration.id} className="border-white/10 bg-white/[0.03]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      {configuration.name ?? `Configurazione #${configuration.id}`}
                    </CardTitle>
                    <CardDescription>
                      {configuration.wheel_category?.name ?? "Categoria"} ·{" "}
                      {configuration.wheel_hub?.name ?? "Mozzo"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between gap-4">
                    <span className="font-medium">{formatPrice(configuration.total_price)}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                      render={<Link to={`/area-personale/configurazioni/${configuration.id}`} />}
                    >
                      Apri
                      <ArrowRight />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Non hai ancora configurazioni salvate.
            </p>
          )}
        </section>
      )}
    </div>
  )
}

const STATIC_WHEEL_MODELS = [
  {
    id: 1,
    name: "Strada",
    description: "",
    base_price: "0.00",
    hero_image_url: "/wheel-configurator/cards/strada.jpg",
  },
  {
    id: 2,
    name: "Gravel",
    description: "",
    base_price: "0.00",
    hero_image_url: "/wheel-configurator/cards/gravel.jpg",
  },
  {
    id: 3,
    name: "MTB",
    description: "",
    base_price: "0.00",
    hero_image_url: "/wheel-configurator/cards/mtb.jpg",
  },
]
