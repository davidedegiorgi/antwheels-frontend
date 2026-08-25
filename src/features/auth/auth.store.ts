import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import type { User } from "@/features/users/users.type"

type AuthStore = {
  user?: User
  token: string
  login: (user: User, token: string) => void
  logout: () => void
  setUser: (user: User) => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: undefined,
      token: "",
      login(user, token) {
        set({ user, token })
      },
      logout() {
        set({ user: undefined, token: "" })
      },
      setUser(user) {
        set({ user })
      },
    }),
    {
      name: "wheelAuthStore",
      storage: createJSONStorage(() => localStorage),
    }
  )
)
