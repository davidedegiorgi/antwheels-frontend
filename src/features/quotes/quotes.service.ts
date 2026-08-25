import { http } from "@/lib/http"
import type { QuoteResponse } from "./quotes.type"

export class QuotesService {
  static async list() {
    const res = await http.get<QuoteResponse[]>("/quotes")
    return res.data
  }

  static async get(id: number) {
    const res = await http.get<QuoteResponse>(`/quotes/${id}`)
    return res.data
  }

  static async create(configurationId: number, notes?: string) {
    const res = await http.post<QuoteResponse>("/quotes", {
      configuration_id: configurationId,
      notes,
    })
    return res.data
  }

  static async updateNotes(id: number, notes: string) {
    const res = await http.put<QuoteResponse>(`/quotes/${id}`, { notes })
    return res.data
  }

  static async remove(id: number) {
    await http.delete(`/quotes/${id}`)
  }

  static async exportPdf(id: number) {
    const res = await http.post<Blob>(
      `/quotes/${id}/export`,
      null,
      { responseType: "blob" }
    )
    return res.data
  }
}
