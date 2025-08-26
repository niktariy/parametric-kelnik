<script setup lang="ts">
defineProps<{
  name: string
  label: string
  srOnly?: string
}>()
</script>

<template>
  <span v-if="srOnly">
    <span :id="`${name}_aria_label`" class="sr-only">
      {{ srOnly }}
    </span>
    <span :aria-hidden="true">{{ label }}</span>
  </span>
  <span v-else>{{ label }}</span>
</template>
