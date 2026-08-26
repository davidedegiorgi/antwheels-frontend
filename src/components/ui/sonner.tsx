import { Toaster as Sonner } from "sonner"

export function Toaster() {
  return (
    <Sonner
      position="top-right"
      theme="dark"
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "border border-white/10 bg-[#050505] text-white shadow-2xl shadow-black/40 backdrop-blur-xl",
          title: "text-sm font-semibold text-white",
          description: "text-sm text-white/70",
          closeButton: "border-white/10 bg-white/10 text-white hover:bg-white/20",
          success: "border-white/15 bg-[#050505] text-white",
          error: "border-red-500/40 bg-[#050505] text-white",
        },
      }}
    />
  )
}
