<script setup lang="ts">
import { SliderRange, SliderRoot, SliderThumb, SliderTrack } from 'reka-ui'

interface RangeSliderProps {
  modelValue: number[]
  min?: number
  max?: number
  step?: number
  ariaLabel?: string
  ariaLabelledby?: string
  formatValue?: (value: number) => string
  disabled?: boolean
}

const props = withDefaults(defineProps<RangeSliderProps>(), {
  step: 1,
  min: 0,
  max: 100,
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: number[]]
  'change': [value: number[]]
}>()

const localValue = ref<number[]>([])
const isDragging = ref(false)

watch(
  () => props.modelValue,
  (newValue) => {
    if (!isDragging.value) {
      localValue.value = [...newValue]
    }
  },
  { immediate: true },
)

function handleValueChange(value: number[] | undefined) {
  if (value && Array.isArray(value) && value.length > 0) {
    localValue.value = [...value]

    emit('update:modelValue', value)
    emit('change', value)
  }
}

function handlePointerDown() {
  isDragging.value = true
}

function handlePointerUp() {
  if (isDragging.value) {
    isDragging.value = false
    emit('update:modelValue', localValue.value)
    emit('change', localValue.value)
  }
}

onMounted(() => {
  document.addEventListener('pointerup', handlePointerUp)
  document.addEventListener('touchend', handlePointerUp)
  document.addEventListener('mouseup', handlePointerUp)
})

onUnmounted(() => {
  document.removeEventListener('pointerup', handlePointerUp)
  document.removeEventListener('touchend', handlePointerUp)
  document.removeEventListener('mouseup', handlePointerUp)
})

function formatValueForScreenReader(value: number): string {
  return props.formatValue ? props.formatValue(value) : value.toString()
}

const instanceId = ref<string>('')
const sliderId = computed(() =>
  instanceId.value ? `range-slider-${instanceId.value}` : '',
)
const minThumbId = computed(() =>
  instanceId.value ? `${sliderId.value}-min-thumb` : '',
)
const maxThumbId = computed(() =>
  instanceId.value ? `${sliderId.value}-max-thumb` : '',
)

onMounted(() => {
  instanceId.value = Math.random().toString(36).substr(2, 9)
})

const displayValue = computed(() =>
  localValue.value.length > 0 ? localValue.value : props.modelValue,
)
</script>

<template>
  <SliderRoot
    :id="sliderId || undefined"
    :model-value="displayValue"
    :min="min"
    :max="max"
    :step="step"
    :disabled="disabled"
    :aria-label="ariaLabel"
    :aria-labelledby="ariaLabelledby"
    class="range-slider"
    role="group"
    @update:model-value="handleValueChange"
    @pointerdown="handlePointerDown"
    @touchstart="handlePointerDown"
    @mousedown="handlePointerDown"
  >
    <SliderTrack class="range-slider__track">
      <SliderRange class="range-slider__range" />
    </SliderTrack>
    <SliderThumb
      :id="minThumbId || undefined"
      class="range-slider__thumb"
      :aria-label="
        instanceId
          ? `Минимальное значение: ${formatValueForScreenReader(
            displayValue[0],
          )}`
          : undefined
      "
      :aria-valuemin="min"
      :aria-valuemax="displayValue[1]"
      :aria-valuenow="displayValue[0]"
      :aria-valuetext="formatValueForScreenReader(displayValue[0])"
    />
    <SliderThumb
      :id="maxThumbId || undefined"
      class="range-slider__thumb"
      :aria-label="
        instanceId
          ? `Максимальное значение: ${formatValueForScreenReader(
            displayValue[1],
          )}`
          : undefined
      "
      :aria-valuemin="displayValue[0]"
      :aria-valuemax="max"
      :aria-valuenow="displayValue[1]"
      :aria-valuetext="formatValueForScreenReader(displayValue[1])"
    />
  </SliderRoot>
</template>

<style lang="scss" scoped>
.range-slider {
  --range-thumb-a11y-size: 2rem;

  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.375rem 0;

  @media (width < $bp-sm) {
    min-height: var(--range-thumb-a11y-size);
  }

  &__track {
    position: relative;
    flex-grow: 1;
    background-color: $slider-track-background;
    border-radius: $slider-track-radius;

    &[data-orientation='horizontal'] {
      height: 3px;
    }
  }

  &__range {
    position: absolute;
    background-color: $slider-range-background;
    border-radius: $slider-range-radius;

    &[data-orientation='horizontal'] {
      height: 100%;
    }
  }

  &__thumb {
    --reka-slider-thumb-transform: translateX(-50%) scale(var(--scale-value, 1));

    display: block;
    width: 0.875rem;
    height: 0.875rem;
    background-color: $slider-thumb-background;
    border-radius: $slider-thumb-radius;
    box-shadow: var(--thumb-shadow, 0 0 0 transparent);
    outline-offset: 2px;
    outline: 2px solid var(--outline-color, transparent);
    cursor: pointer;
    transition:
      transform 0.06s ease-in,
      box-shadow 0.1s ease;

    @media (width < $bp-sm) {
      min-width: var(--range-thumb-a11y-size);
      min-height: var(--range-thumb-a11y-size);
    }

    &:focus-visible:not(:active) {
      --scale-value: 1.2;
      --outline-color: #{$slider-thumb-background};
    }

    &:hover:not(:disabled) {
      --scale-value: 1.2;
      --thumb-shadow: 0 2px 8px #{rgba($slider-thumb-background, 0.15)};
    }

    &:active:not(:disabled) {
      --scale-value: 1;
      --thumb-shadow: 0 4px 12px #{rgba($slider-thumb-background, 0.4)};
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    @media (prefers-contrast: more) {
      border: 2px solid ButtonText;
      background-color: ButtonFace;
    }

    @media (prefers-reduced-motion: reduce) {
      transition: none;
    }
  }

  &[data-disabled] {
    opacity: 0.6;
    pointer-events: none;
  }

  @media (prefers-contrast: more) {
    .range-slider__track {
      background-color: ButtonShadow;
      border: 1px solid ButtonText;
    }

    .range-slider__range {
      background-color: Highlight;
    }
  }
}
</style>
