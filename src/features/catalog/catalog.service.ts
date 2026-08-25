import { http } from "@/lib/http"
import type { WheelCategory, WheelHub, WheelComponent } from "./catalog.type"

export class CatalogService {
  static async listWheelCategories() {
    const res = await http.get<WheelCategory[]>("/wheel-categories")
    return res.data
  }

  static async getWheelCategory(id: number) {
    const res = await http.get<WheelCategory>(`/wheel-categories/${id}`)
    return res.data
  }

  static async listWheelHubs() {
    const res = await http.get<WheelHub[]>("/wheel-hubs")
    return res.data
  }

  static async listWheelComponents() {
    const res = await http.get<WheelComponent[]>("/wheel-components")
    return res.data
  }
}
