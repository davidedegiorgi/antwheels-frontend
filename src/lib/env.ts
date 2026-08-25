const backendUrl = (import.meta.env.VITE_BACKEND_URL as string | undefined)?.replace(/\/+$/, "") ?? ""

export const myEnv = {
  backendUrl,
  backendApiUrl: `${backendUrl}/api`,
}
