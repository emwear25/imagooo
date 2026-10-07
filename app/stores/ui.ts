import { defineStore } from 'pinia'

export interface Toast {
  id: number
  title: string
  body?: string
  image?: string
  action?: { label: string; to: string }
  tone?: 'success' | 'info'
}

let seq = 0

export const useUiStore = defineStore('ui', {
  state: () => ({
    cartOpen: false,
    menuOpen: false,
    toasts: [] as Toast[],
  }),
  actions: {
    toast(t: Omit<Toast, 'id'>, ttl = 4800) {
      const id = ++seq
      this.toasts = [...this.toasts.slice(-2), { ...t, id }]
      if (import.meta.client) setTimeout(() => this.dismiss(id), ttl)
    },
    dismiss(id: number) {
      this.toasts = this.toasts.filter((t) => t.id !== id)
    },
  },
})
