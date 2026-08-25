export type QuoteStatus = "draft" | "completed" | "exported"

export type Quote = {
  id: number
  configuration_id: number
  user_id: number
  total_amount: string
  status: QuoteStatus
  notes?: string | null
  created_at?: string
  updated_at?: string
}

export type QuoteDetails = {
  wheel_category: { name: string; price: string | number }
  wheel_hub: {
    name: string
    engine_type: string
    horsepower: number
    price: string | number
  }
  components: Array<{
    id: number
    name: string
    category: string
    price: string | number
    unit_price?: string | number
    spoke_count?: number | null
  }>
  total: number | string
}

export type QuoteResponse = {
  quote: Quote
  details: QuoteDetails
}
