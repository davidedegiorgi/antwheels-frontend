import { http } from "@/lib/http"
import { useAuthStore } from "./auth.store"
import type { User } from "@/features/users/users.type"

export class AuthService {
  static async login(data: { email: string; password: string }) {
    const res = await http.post<{
      message: string
      user: User
      token: string
    }>("/auth/login", data)
    const { token, user } = res.data
    if (!token) throw new Error("Token non valido")
    useAuthStore.getState().login(user, token)
    return res.data
  }

  static async register(data: {
    name: string
    last_name: string
    email: string
    password: string
    password_confirmation: string
  }) {
    const res = await http.post<{ message: string; user: User }>(
      "/auth/register",
      data
    )
    return res.data
  }

  static async forgotPassword(data: { email: string }) {
    const res = await http.post<{ message: string }>("/auth/forgot-password", data)
    return res.data
  }

  static async resetPassword(data: {
    token: string
    email: string
    password: string
    password_confirmation: string
  }) {
    const res = await http.post<{ message: string }>("/auth/reset-password", data)
    return res.data
  }

  static async me() {
    const res = await http.get<User>("/auth/me")
    useAuthStore.getState().setUser(res.data)
    return res.data
  }

  static async updateProfile(data: { name: string; last_name: string }) {
    const res = await http.put<User>("/auth/profile", data)
    useAuthStore.getState().setUser(res.data)
    return res.data
  }

  static async deleteAccount() {
    await http.delete("/auth/profile")
    useAuthStore.getState().logout()
  }

  static async logout() {
    try {
      await http.post("/auth/logout")
    } finally {
      useAuthStore.getState().logout()
    }
  }
}
