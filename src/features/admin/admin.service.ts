import { http } from "@/lib/http"

export class AdminService {
  static async getStats() {
    const res = await http.get<{
      stats: {
        total_users: number
        total_quotes: number
        completed_quotes: number
        draft_quotes: number
        exported_quotes: number
        total_revenue: number
        average_quote_value: number
      }
    }>("/admin/dashboard/stats")
    return res.data.stats
  }

  static async getQuotesByStatus() {
    const res = await http.get<{
      status: Record<string, number>
    }>("/admin/quotes/by-status")
    return res.data.status
  }

  static async getPopularModels() {
    const res = await http.get<{
      models: Array<{ id: number; name: string; count: number }>
    }>("/admin/models/popular")
    return res.data.models
  }

  static async getRevenueByMonth() {
    const res = await http.get<{
      revenue: Array<{ month: string; revenue: number }>
    }>("/admin/revenue/by-month")
    return res.data.revenue
  }

  static async getUsers(page = 1) {
    const res = await http.get("/admin/users", { params: { page } })
    return res.data
  }
}
