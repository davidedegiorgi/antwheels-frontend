const backendUrl =
  (import.meta.env.VITE_BACKEND_URL as string | undefined)?.replace(/\/+$/, "") ??
  "https://antwheels-backend.onrender.com"

export const myEnv = {
  backendUrl,
  backendApiUrl: `${backendUrl}/api`,
}
