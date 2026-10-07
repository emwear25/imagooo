import type { Ref } from 'vue'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

let locks = 0

function lockScroll(on: boolean) {
  if (!import.meta.client) return
  locks = Math.max(0, locks + (on ? 1 : -1))
  const el = document.documentElement
  if (locks > 0) {
    el.style.setProperty('--scrollbar', `${window.innerWidth - el.clientWidth}px`)
    el.classList.add('is-locked')
  } else {
    el.classList.remove('is-locked')
  }
}

/**
 * Modal behaviour for drawers/dialogs: focus moves inside on open, Tab is trapped,
 * Escape closes, focus returns to the opener, background scroll is locked.
 */
export function useDialog(open: Ref<boolean>, panel: Ref<HTMLElement | null>, close: () => void) {
  let opener: HTMLElement | null = null

  function onKey(e: KeyboardEvent) {
    if (!open.value || !panel.value) return
    if (e.key === 'Escape') {
      e.stopPropagation()
      close()
      return
    }
    if (e.key !== 'Tab') return
    const items = [...panel.value.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.offsetParent !== null)
    if (!items.length) {
      e.preventDefault()
      panel.value.focus()
      return
    }
    const first = items[0]!
    const last = items[items.length - 1]!
    if (e.shiftKey && (document.activeElement === first || document.activeElement === panel.value)) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  watch(open, async (isOpen, wasOpen) => {
    if (!import.meta.client) return
    if (isOpen) {
      opener = document.activeElement as HTMLElement | null
      lockScroll(true)
      document.addEventListener('keydown', onKey)
      await nextTick()
      const target = panel.value?.querySelector<HTMLElement>('[data-autofocus]') ?? panel.value
      target?.focus({ preventScroll: true })
    } else if (wasOpen) {
      lockScroll(false)
      document.removeEventListener('keydown', onKey)
      opener?.focus?.({ preventScroll: true })
    }
  })

  onBeforeUnmount(() => {
    if (open.value) lockScroll(false)
    if (import.meta.client) document.removeEventListener('keydown', onKey)
  })
}
