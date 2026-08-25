import { http } from "@/lib/http"
import type { WheelCategory, WheelHub, WheelComponent } from "./catalog.type"

function asArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[]

  if (
    value &&
    typeof value === "object" &&
    "data" in value &&
    Array.isArray((value as { data?: unknown }).data)
  ) {
    return (value as { data: T[] }).data
  }

  return []
}

export class CatalogService {
  static async listWheelCategories() {
    const res = await http.get<unknown>("/wheel-categories")
    return asArray<WheelCategory>(res.data)
  }

  static async getWheelCategory(id: number) {
    const res = await http.get<WheelCategory>(`/wheel-categories/${id}`)
    return res.data
  }

  static async listWheelHubs() {
    const res = await http.get<unknown>("/wheel-hubs")
    return asArray<WheelHub>(res.data)
  }

  static async listWheelComponents() {
    const res = await http.get<unknown>("/wheel-components")
    return asArray<WheelComponent>(res.data)
  }
}
