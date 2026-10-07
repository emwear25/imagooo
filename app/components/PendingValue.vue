<script setup lang="ts">
import type { SettingStatus } from '~/config/store'

/** Renders a confirmed setting, or an explicit „предстои“ placeholder. */
const props = defineProps<{
  setting: { value: unknown; status: SettingStatus }
  placeholder?: string
  /** Render a confirmed email / phone as a mailto: / tel: link. */
  link?: 'mail' | 'tel'
}>()
const text = computed(() => {
  const v = props.setting.value
  if (props.setting.status !== 'confirmed' || v == null) return ''
  return Array.isArray(v) ? v.join(', ') : String(v)
})
const href = computed(() => {
  if (!text.value || !props.link) return ''
  return props.link === 'mail' ? `mailto:${text.value}` : `tel:${text.value.replace(/[^\d+]/g, '')}`
})
</script>

<template>
  <a v-if="text && href" :href="href">{{ text }}</a>
  <span v-else-if="text">{{ text }}</span>
  <span v-else class="pending">
    <AppIcon name="clock" :size="14" />
    {{ placeholder ?? 'предстои уточняване' }}
  </span>
</template>
