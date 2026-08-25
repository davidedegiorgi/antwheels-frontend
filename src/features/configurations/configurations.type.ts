import type { WheelCategory, WheelHub, WheelComponent } from "@/features/catalog/catalog.type"

export type Configuration = {
  id: number
  user_id: number
  wheel_category_id: number
  wheel_hub_id: number
  name?: string | null
  description?: string | null
  total_price: string
  wheel_category?: WheelCategory
  wheel_hub?: WheelHub
  components?: WheelComponent[]
  created_at?: string
  updated_at?: string
}
