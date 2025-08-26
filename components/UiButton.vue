<script setup lang="ts">
type ButtonVariant = 'solid' | 'outlined' | 'text' | 'raised'
type ButtonSize = 'small' | 'medium' | 'large'

interface UiButtonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  disabled?: boolean
  loading?: boolean
}
const props = defineProps<UiButtonProps>()

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

const slots = useSlots()
const hasText = computed(() => !!slots.default)

const blockClasses = computed(() => {
  return [
    'button',
    `button--${props.variant ?? 'solid'}`,
    `button--${props.size ?? 'medium'}`,
    {
      'button--disabled': props.disabled,
      'button--loading': props.loading,
      'button--has-icon': !!slots.leadingIcon || !!slots.trailingIcon,
      'button--has-text': hasText.value,
    },
  ]
})

function handleClick(event: MouseEvent) {
  if (props.disabled || props.loading) {
    event.preventDefault()
    return
  }
  emit('click', event)
}
</script>

<template>
  <button
    :class="blockClasses"
    :disabled="disabled"
    :aria-disabled="disabled || loading ? 'true' : 'false'"
    :aria-busy="loading ? 'true' : 'false'"
    type="button"
    @click="handleClick"
  >
    <span
      v-if="loading"
      class="button__spinner"
      aria-hidden="true"
    />
    <slot name="leadingIcon" />
    <span v-if="hasText">
      <slot />
    </span>
    <slot name="trailingIcon" />
  </button>
</template>

<style lang="scss" scoped>
@use 'sass:map';

@mixin button-variant($variant) {
  $variant-map: map.get($button-colors, $variant);

  $bg-map: map.get($variant-map, 'background');
  $text-map: map.get($variant-map, 'text');
  $shadow-map: if(map.has-key($variant-map, 'shadow'), map.get($variant-map, 'shadow'), ());

  $bg-default: map.get($bg-map, 'default');
  $bg-hover: map.get($bg-map, 'hover');
  $bg-focus: map.get($bg-map, 'focus');

  $text-default: map.get($text-map, 'default');
  $text-hover: map.get($text-map, 'hover');
  $text-focus: map.get($text-map, 'focus');

  $shadow-default: map.get($shadow-map, 'default');
  $shadow-hover: map.get($shadow-map, 'hover');
  $shadow-focus: map.get($shadow-map, 'focus');

  background: $bg-default;
  color: $text-default;

  @if $shadow-default {
    box-shadow: 0 2px 6px rgba($shadow-default, 0.4);
  }

  border: if($variant == 'outlined', 1px solid $button-border-color, none);

  &:hover {
    background: $bg-hover;
    color: $text-hover;
    @if $shadow-hover {
      box-shadow: 0 4px 10px rgba($shadow-hover, 0.4);
    }
    @if $variant == 'outlined' {
      border-color: $bg-hover;
    }
  }
  &:focus {
    background: $bg-focus;
    color: $text-focus;
  }
  &:focus-visible {
    background: $bg-focus;
    color: $text-focus;
    outline: 2px solid $bg-focus;
    outline-offset: 2px;
    @if $shadow-focus {
      box-shadow: 0 4px 10px rgba($shadow-focus, 0.4);
    }
    @if $variant == 'outlined' {
      border-color: $bg-focus;
    }
    @if $variant == 'text' {
      outline-color: $bg-focus;
    }
  }
}

.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-radius: $button-radius;
  font-weight: 500;
  cursor: pointer;
  line-height: 1.5;
  transition: all 0.2s ease;
  border: none;
  background: none;
  user-select: none;

  &--solid {
    @include button-variant('solid');
  }

  &--outlined {
    @include button-variant('outlined');
  }

  &--text {
    font-weight: 400;
    @include button-variant('text');
  }

  &--raised {
    @include button-variant('raised');
  }

  &:disabled,
  &--disabled {
    pointer-events: none;
  }

  &:disabled,
  &--disabled,
  &[aria-disabled='true'] {
    cursor: not-allowed;
    box-shadow: none;
    opacity: 0.5;
  }

  &--loading {
    cursor: progress;
  }

  &--small {
    font-size: 0.875rem;
    padding: 0.375rem 1rem;
  }

  &--medium {
    font-size: 1rem;
    padding: 0.5rem 1.5rem;
  }

  &--large {
    font-size: 1.25rem;
    padding: 0.75rem 1.75rem;
  }

  &--has-icon:not(&--has-text) {
    font-size: 1.25rem;
    padding-inline: 0.5rem;
  }

  svg {
    width: 1em;
    height: 1em;
    fill: currentColor;
  }

  &__spinner {
    width: 1em;
    height: 1em;
    border: 2px solid currentColor;
    border-top-color: transparent;
    border-radius: $button-radius;
    animation: spin 1s linear infinite;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
