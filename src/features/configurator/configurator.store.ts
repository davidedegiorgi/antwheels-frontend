import { create } from "zustand"
import type { WizardStepId } from "@/data/wheel-brand"

type ConfiguratorState = {
  step: WizardStepId
  wheelCategoryId?: number
  wheelHubId?: number
  selectedOptionalIds: number[]
  configName: string
}

type ConfiguratorStore = ConfiguratorState & {
  setStep: (step: WizardStepId) => void
  setWheelCategoryId: (id: number) => void
  setWheelHubId: (id: number) => void
  setSelectedOptionalIds: (ids: number[]) => void
  toggleOptionalId: (id: number) => void
  setConfigName: (name: string) => void
  saveDraft: (returnTo: string) => void
  restoreDraft: () => string | undefined
  clearDraft: () => void
  reset: () => void
}

const initial: ConfiguratorState = {
  step: "interior" as WizardStepId,
  wheelCategoryId: undefined,
  wheelHubId: undefined,
  selectedOptionalIds: [] as number[],
  configName: "",
}

const DRAFT_STORAGE_KEY = "wheel-configurator:draft"

type ConfiguratorDraft = typeof initial & {
  returnTo: string
}

function canUseSessionStorage() {
  return typeof window !== "undefined" && Boolean(window.sessionStorage)
}

export const useConfiguratorStore = create<ConfiguratorStore>((set, get) => ({
  ...initial,
  setStep(step) {
    set({ step })
  },
  setWheelCategoryId(id) {
    set((state) => {
      if (state.wheelCategoryId === id) return state
      return {
        wheelCategoryId: id,
        wheelHubId: undefined,
        selectedOptionalIds: [],
        configName: "",
      }
    })
  },
  setWheelHubId(id) {
    set({ wheelHubId: id })
  },
  setSelectedOptionalIds(ids) {
    set({ selectedOptionalIds: ids })
  },
  toggleOptionalId(id) {
    set((s) => ({
      selectedOptionalIds: s.selectedOptionalIds.includes(id)
        ? s.selectedOptionalIds.filter((x) => x !== id)
        : [...s.selectedOptionalIds, id],
    }))
  },
  setConfigName(name) {
    set({ configName: name })
  },
  saveDraft(returnTo) {
    if (!canUseSessionStorage()) return

    const {
      step,
      wheelCategoryId,
      wheelHubId,
      selectedOptionalIds,
      configName,
    } = get()

    const hasDraftContent =
      Boolean(wheelCategoryId) ||
      Boolean(wheelHubId) ||
      selectedOptionalIds.length > 0 ||
      configName.trim().length > 0

    if (!hasDraftContent) return

    const draft: ConfiguratorDraft = {
      step,
      wheelCategoryId,
      wheelHubId,
      selectedOptionalIds,
      configName,
      returnTo,
    }

    window.sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft))
  },
  restoreDraft() {
    if (!canUseSessionStorage()) return undefined

    const rawDraft = window.sessionStorage.getItem(DRAFT_STORAGE_KEY)
    if (!rawDraft) return undefined

    try {
      const draft = JSON.parse(rawDraft) as Partial<ConfiguratorDraft>
      set({
        step: ((draft.step as string | undefined) === "model" ? "motor" : draft.step) ?? "summary",
        wheelCategoryId: draft.wheelCategoryId,
        wheelHubId: draft.wheelHubId,
        selectedOptionalIds: draft.selectedOptionalIds ?? [],
        configName: draft.configName ?? "",
      })
      return draft.returnTo
    } catch {
      window.sessionStorage.removeItem(DRAFT_STORAGE_KEY)
      return undefined
    }
  },
  clearDraft() {
    if (!canUseSessionStorage()) return
    window.sessionStorage.removeItem(DRAFT_STORAGE_KEY)
  },
  reset() {
    set(initial)
  },
}))
