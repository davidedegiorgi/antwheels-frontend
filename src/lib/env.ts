export const myEnv = {
  backendUrl: import.meta.env.VITE_BACKEND_URL as string,
  backendApiUrl: `${import.meta.env.VITE_BACKEND_URL}/api`,
}
