export type WheelHub = {
  id: number
  wheel_category_id: number
  name: string
  engine_type: string
  horsepower: number
  price: string
  image_url?: string
  created_at?: string
  updated_at?: string
}

export type WheelCategory = {
  id: number
  name: string
  description: string
  base_price: string
  wheel_hubs?: WheelHub[]
  hero_image_url?: string
  available_colors?: Array<{
    name: string
    hex: string
    image: string
  }>
  created_at?: string
  updated_at?: string
}

export type WheelComponent = {
  id: number
  name: string
  description: string
  price: string
  category: string
  exclusive_group: string | null
  image_url?: string
  images?: Array<{
    id: number
    component_id: number
    wheel_category_id: number
    image_url: string
  }>
  created_at?: string
  updated_at?: string
}
