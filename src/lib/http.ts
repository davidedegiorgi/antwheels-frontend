import axios from "axios"
import { useAuthStore } from "@/features/auth/auth.store"
import { myEnv } from "./env"

export const http = axios.create({
  baseURL: myEnv.backendApiUrl,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
})

http.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
