import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { createBrowserRouter, RouterProvider } from "react-router"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import WebsiteLayout from "@/layouts/website-layout"
import AuthLayout from "@/layouts/auth-layout"
import PrivateLayout from "@/layouts/private-layout"
import AdminLayout from "@/layouts/admin-layout"
import HomePage from "@/pages/home-page"
import ModelsPage from "@/pages/models-page"
import ConfiguratorPage from "@/pages/configurator-page"
import LoginPage from "@/pages/login-page"
import RegisterPage from "@/pages/register-page"
import ForgotPasswordPage from "@/pages/forgot-password-page"
import ResetPasswordPage from "@/pages/reset-password-page"
import AreaPersonalePage from "@/pages/private/area-personale-page"
import ConfigurationComparePage from "@/pages/private/configuration-compare-page"
import ConfigurationEditPage from "@/pages/private/configuration-edit-page"
import QuoteDetailPage from "@/pages/private/quote-detail-page"
import AccountPage from "@/pages/private/account-page"
import AdminDashboardPage from "@/pages/admin/admin-dashboard-page"
import LegalPage from "@/pages/legal-page"
import "./index.css"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, retry: 1 },
  },
})

const router = createBrowserRouter([
  {
    path: "/",
    element: <WebsiteLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "modelli", element: <ModelsPage /> },
      { path: "configura", element: <ConfiguratorPage /> },
      { path: "configura/:slug", element: <ConfiguratorPage /> },
      { path: ":type", element: <LegalPage /> },
    ],
  },
  {
    path: "/",
    element: <AuthLayout />,
    children: [
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      { path: "forgot-password", element: <ForgotPasswordPage /> },
      { path: "reset-password", element: <ResetPasswordPage /> },
    ],
  },
  {
    path: "/area-personale",
    element: <PrivateLayout />,
    children: [
      { index: true, element: <AccountPage /> },
      { path: "configurazioni", element: <AreaPersonalePage /> },
      { path: "configurazioni/confronta", element: <ConfigurationComparePage /> },
      {
        path: "configurazioni/:id",
        element: <ConfigurationEditPage />,
      },
      { path: "preventivi/:id", element: <QuoteDetailPage /> },
    ],
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [{ index: true, element: <AdminDashboardPage /> }],
  },
])

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>
)

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.warn("Service worker registration failed", error)
    })
  })
}
