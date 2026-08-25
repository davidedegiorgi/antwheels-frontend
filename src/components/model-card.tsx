import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { WheelModelAsset } from "@/data/wheel-brand"
import type { WheelCategory } from "@/features/catalog/catalog.type"
import { Link } from "react-router"

type ModelCardProps = {
  model: WheelCategory
  asset: WheelModelAsset
}

const CARD_TITLES: Record<string, string> = {
  road: "Strada",
  gravel: "Gravel",
  mtb: "MTB",
}

export default function ModelCard({ model, asset }: ModelCardProps) {
  const modelImage = asset.heroImage
  const title = CARD_TITLES[asset.slug] ?? model.name

  return (
    <Card className="group relative min-h-[460px] overflow-hidden border-white/10 bg-black p-0 shadow-2xl shadow-black/30 transition-all duration-500 hover:-translate-y-1 hover:border-white/35 hover:shadow-white/[0.06] md:min-h-[540px]">
      <img
        src={modelImage}
        alt={title}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        loading="lazy"
        onError={(e) => {
          e.currentTarget.src =
            "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=1200&q=80"
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/5 to-black/90" />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.16),transparent_28%,transparent_72%,rgba(255,255,255,0.08))] opacity-70 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="relative z-10 flex h-full min-h-[460px] flex-col justify-end p-5 md:min-h-[540px] md:p-6">
        <div className="mb-5 h-px w-12 bg-white/70 transition-all duration-500 group-hover:w-24" />
        <p
          className="mb-6 -skew-x-10 text-4xl font-bold italic uppercase leading-none tracking-[0.16em] text-white sm:text-5xl"
          style={{ textShadow: "0 14px 34px rgba(0,0,0,0.95)" }}
        >
          {title}
        </p>
        <Button
          className="h-12 w-full rounded-full border border-white/20 bg-white/12 text-white shadow-xl shadow-black/30 backdrop-blur-md transition-colors hover:bg-white hover:text-black"
          render={<Link to={`/configura/${asset.slug}`} />}
        >
          <span
            className="-skew-x-6 text-sm font-semibold uppercase tracking-[0.32em]"
          >
            Configura
          </span>
        </Button>
      </div>
    </Card>
  )
}

