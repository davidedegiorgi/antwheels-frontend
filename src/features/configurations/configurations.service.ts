import { http } from "@/lib/http"
import type { Configuration } from "./configurations.type"

export class ConfigurationsService {
  static async list() {
    const res = await http.get<Configuration[]>("/configurations")
    return res.data
  }

  static async get(id: number) {
    const res = await http.get<Configuration>(`/configurations/${id}`)
    return res.data
  }

  static async create(data: {
    wheel_category_id: number
    wheel_hub_id: number
    name?: string
    description?: string
    component_ids: number[]
  }) {
    const res = await http.post<Configuration>("/configurations", {
      ...data,
      components: data.component_ids,
    })
    return res.data
  }

  static async update(
    id: number,
    data: {
      name?: string
      description?: string
      wheel_hub_id?: number
      component_ids?: number[]
    }
  ) {
    const res = await http.put<Configuration>(`/configurations/${id}`, {
      ...data,
      components: data.component_ids,
    })
    return res.data
  }

  static async remove(id: number) {
    await http.delete(`/configurations/${id}`)
  }
}
