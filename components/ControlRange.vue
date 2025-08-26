<script setup lang="ts">
import type { KeyboardDirectionalNavigationKey } from '~/types/key-navigation-types'

interface RangeProps {
  label: string
  minValue: number
  maxValue: number
  absoluteMin: number
  absoluteMax: number
  step?: number
  formatAsPrice?: boolean
  disabled?: boolean
}

interface Emits {
  (e: 'update:minValue' | 'update:maxValue', value: number): void
  (e: 'update:range', value: { min: number, max: number }): void
}

interface RangeValue {
  min: number
  max: number
}

const props = withDefaults(defineProps<RangeProps>(), {
  step: 1,
  formatAsPrice: false,
  disabled: false,
})

const emit = defineEmits<Emits>()

const ALLOWED_KEYS: readonly KeyboardDirectionalNavigationKey[] = [
  'Backspace',
  'Delete',
  'Tab',
  'Escape',
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'ArrowDown',
  'Home',
  'End',
]

const NUMERIC_REGEX = /^\d$/
const SPACE_SEPARATOR_REGEX = /\B(?=(\d{3})+(?!\d))/g
const NON_NUMERIC_REGEX = /\D/g
const NON_NUMERIC_WITH_SPACES_REGEX = /[^0-9\s]/g

const instanceId = ref<string>('')
const minSpanRef = ref<HTMLSpanElement>()
const maxSpanRef = ref<HTMLSpanElement>()
const minInputRef = ref<HTMLInputElement>()
const maxInputRef = ref<HTMLInputElement>()

const fieldsetId = computed(() => `control-range-${instanceId.value}`)
const minInputId = computed(() => `${fieldsetId.value}-min`)
const maxInputId = computed(() => `${fieldsetId.value}-max`)
const minLabelId = computed(() => `label-${minInputId.value}`)
const maxLabelId = computed(() => `label-${maxInputId.value}`)
const rangeValue = computed(() => [props.minValue, props.maxValue])

function generateInstanceId(): string {
  return Math.random().toString(36).substring(2, 11)
}

function formatPriceValue(value: number): string {
  if (!props.formatAsPrice)
    return value.toString()
  return value.toString().replace(SPACE_SEPARATOR_REGEX, ' ')
}

function clampValue(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function filterNumericInput(text: string, allowSpaces = false): string {
  return allowSpaces
    ? text.replace(NON_NUMERIC_WITH_SPACES_REGEX, '')
    : text.replace(NON_NUMERIC_REGEX, '')
}

function parseNumericValue(text: string): number {
  return Number(text.replace(/\s/g, ''))
}

function setCursorToEnd(element: HTMLElement): void {
  const range = document.createRange()
  const selection = window.getSelection()
  if (selection) {
    range.selectNodeContents(element)
    range.collapse(false)
    selection.removeAllRanges()
    selection.addRange(range)
  }
}

function updateElementValue(element: HTMLElement | undefined, value: string): void {
  if (element) {
    if (element.tagName === 'SPAN') {
      element.textContent = value
    }
    else if (element.tagName === 'INPUT') {
      (element as HTMLInputElement).value = value
    }
  }
}

function updateDisplayValues(): void {
  updateElementValue(minSpanRef.value, formatPriceValue(props.minValue))
  updateElementValue(maxSpanRef.value, formatPriceValue(props.maxValue))
  updateElementValue(minInputRef.value, props.minValue.toString())
  updateElementValue(maxInputRef.value, props.maxValue.toString())
}

function handleKeydown(event: KeyboardEvent): void {
  if (props.disabled) {
    event.preventDefault()
    return
  }

  const { key, ctrlKey, metaKey } = event

  const isNumericKey = NUMERIC_REGEX.test(key)
  const isSpaceKey = key === ' ' && props.formatAsPrice
  const isAllowedKey = ALLOWED_KEYS.includes(
    key as KeyboardDirectionalNavigationKey,
  )
  const isCtrlCmd = ctrlKey || metaKey

  if (key === 'Enter') {
    event.preventDefault();
    (event.target as HTMLElement).blur()
    return
  }

  if (!isNumericKey && !isSpaceKey && !isAllowedKey && !isCtrlCmd) {
    event.preventDefault()
  }
}

function handleSpanInput(event: Event, type: 'min' | 'max', inputRef: typeof minInputRef | typeof maxInputRef): void {
  if (props.disabled)
    return

  const target = event.target as HTMLSpanElement
  const rawText = target.textContent || ''
  const filteredText = filterNumericInput(rawText, props.formatAsPrice)

  if (rawText !== filteredText) {
    target.textContent = filteredText
    setCursorToEnd(target)
  }

  const inputValue = parseNumericValue(filteredText)
  if (!Number.isNaN(inputValue)) {
    const bounds
        = type === 'min'
          ? { min: props.absoluteMin, max: props.maxValue }
          : { min: props.minValue, max: props.absoluteMax }

    const clampedValue = clampValue(inputValue, bounds.min, bounds.max)

    updateElementValue(inputRef.value, clampedValue.toString())

    const eventName = type === 'min' ? 'update:minValue' : 'update:maxValue'
    emit(eventName, clampedValue)

    const rangeUpdate: RangeValue
        = type === 'min'
          ? { min: clampedValue, max: props.maxValue }
          : { min: props.minValue, max: clampedValue }

    emit('update:range', rangeUpdate)
  }
}

function handleSpanBlur(spanRef: typeof minSpanRef | typeof maxSpanRef, inputRef: typeof minInputRef | typeof maxInputRef, type: 'min' | 'max'): void {
  if (props.disabled)
    return

  const target = spanRef.value
  if (!target)
    return

  const rawText = target.textContent || ''
  const filteredText = filterNumericInput(rawText, props.formatAsPrice)
  const inputValue = parseNumericValue(filteredText)

  if (!Number.isNaN(inputValue)) {
    const bounds
        = type === 'min'
          ? { min: props.absoluteMin, max: props.maxValue }
          : { min: props.minValue, max: props.absoluteMax }

    const clampedValue = clampValue(inputValue, bounds.min, bounds.max)

    if (inputValue !== clampedValue) {
      updateElementValue(inputRef.value, clampedValue.toString())

      const eventName
          = type === 'min' ? 'update:minValue' : 'update:maxValue'
      emit(eventName, clampedValue)

      const rangeUpdate: RangeValue
          = type === 'min'
            ? { min: clampedValue, max: props.maxValue }
            : { min: props.minValue, max: clampedValue }

      emit('update:range', rangeUpdate)
      target.textContent = formatPriceValue(inputValue)
    }
    else {
      target.textContent = formatPriceValue(clampedValue)
    }
  }
  else {
    const currentValue = type === 'min' ? props.minValue : props.maxValue
    target.textContent = formatPriceValue(currentValue)
  }

  validateRange()
}

function handleMinSpanInput(event: Event): void {
  handleSpanInput(event, 'min', minInputRef)
}

function handleMaxSpanInput(event: Event): void {
  handleSpanInput(event, 'max', maxInputRef)
}

function handleMinSpanBlur(): void {
  handleSpanBlur(minSpanRef, minInputRef, 'min')
}

function handleMaxSpanBlur(): void {
  handleSpanBlur(maxSpanRef, maxInputRef, 'max')
}

function handleRangeChange(value: number[]): void {
  if (props.disabled)
    return

  const [min, max] = value
  emit('update:minValue', min)
  emit('update:maxValue', max)
  emit('update:range', { min, max })
}

function validateRange(): void {
  if (props.disabled)
    return

  let newMin = clampValue(props.minValue, props.absoluteMin, props.maxValue)
  let newMax = clampValue(props.maxValue, props.minValue, props.absoluteMax)

  if (newMin > newMax) {
    newMin = newMax
  }

  if (newMax < newMin) {
    newMax = newMin
  }

  const hasMinChanged = newMin !== props.minValue
  const hasMaxChanged = newMax !== props.maxValue

  if (hasMinChanged) {
    emit('update:minValue', newMin)
  }

  if (hasMaxChanged) {
    emit('update:maxValue', newMax)
  }

  if (hasMinChanged || hasMaxChanged) {
    emit('update:range', { min: newMin, max: newMax })
  }
}

onMounted(() => {
  instanceId.value = generateInstanceId()
  nextTick(() => {
    updateDisplayValues()
  })
})

watch([() => props.minValue, () => props.maxValue], () => {
  updateDisplayValues()
})
</script>

<template>
  <fieldset
    :id="fieldsetId"
    class="control-range"
    :disabled="disabled"
  >
    <legend class="control-range__label">
      {{ label }}
    </legend>
    <div class="control-range__fields">
      <div class="control-range__inputs">
        <div class="control-range__input-group">
          <label
            :id="minLabelId"
            class="control-range__input-label"
          >от</label>
          <div class="control-range__input-wrapper">
            <input
              :id="minInputId"
              ref="minInputRef"
              :value="minValue"
              type="number"
              class="control-range__input control-range__input--hidden"
              :min="absoluteMin"
              :max="maxValue"
              :step="step"
              :disabled="disabled"
              tabindex="-1"
              aria-hidden="true"
              readonly
            >
            <span
              ref="minSpanRef"
              contenteditable="true"
              class="control-range__input control-range__input--visible"
              :class="{ 'control-range__input--disabled': disabled }"
              role="textbox"
              :aria-labelledby="minLabelId"
              :aria-disabled="disabled"
              @input="handleMinSpanInput"
              @keydown="handleKeydown"
              @blur="handleMinSpanBlur"
            >{{ formatPriceValue(minValue) }}</span>
          </div>
        </div>
        <div class="control-range__input-group">
          <label
            :id="maxLabelId"
            class="control-range__input-label"
          >до</label>
          <div class="control-range__input-wrapper">
            <input
              :id="maxInputId"
              ref="maxInputRef"
              :value="maxValue"
              type="number"
              class="control-range__input control-range__input--hidden"
              :min="minValue"
              :max="absoluteMax"
              :step="step"
              :disabled="disabled"
              tabindex="-1"
              aria-hidden="true"
              readonly
            >
            <span
              ref="maxSpanRef"
              contenteditable="true"
              class="control-range__input control-range__input--visible"
              :class="{ 'control-range__input--disabled': disabled }"
              role="textbox"
              :aria-labelledby="maxLabelId"
              :aria-disabled="disabled"
              @input="handleMaxSpanInput"
              @keydown="handleKeydown"
              @blur="handleMaxSpanBlur"
            >{{ formatPriceValue(maxValue) }}</span>
          </div>
        </div>
      </div>
      <div class="control-range__slider">
        <RangeSlider
          :model-value="rangeValue"
          :min="absoluteMin"
          :max="absoluteMax"
          :step="step"
          :disabled="disabled"
          @update:model-value="handleRangeChange"
        />
      </div>
    </div>
  </fieldset>
</template>

<style lang="scss" scoped>
  .control-range {
  &__label {
    font-size: 0.875rem;
    font-weight: 400;
    color: $main-font-color;
    margin-block-end: 0.5rem;
  }

  &__fields {
    display: flex;
    flex-direction: column;
    gap: 4px;
    width: 100%;
  }

  &__inputs {
    display: flex;
    gap: 2px;
  }

  &__input-group {
    flex: 1;
    display: flex;
    gap: 4px;
    align-items: center;
  }

  &__input-label {
    font-size: 1rem;
    font-weight: 400;
    color: $input-label-color;
  }

  &__input-wrapper {
    position: relative;
  }

  &__input {
    width: auto;
    padding: 4px;
    border: none;
    border-radius: $input-border-radius;
    font-size: 1rem;
    line-height: 1;
    font-weight: 500;
    color: $input-value-color;
    text-align: start;
    min-width: 80px;

    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    &[type='number'] {
      -moz-appearance: textfield;
    }

    &--hidden {
      position: absolute;
      left: -9999px;
      opacity: 0;
      pointer-events: none;
    }

    &--visible {
      display: inline-block;
      cursor: text;
      white-space: nowrap;
      background-color: transparent;
      box-shadow: 0 0 0 1px var(--input-border-color);
      transition: box-shadow, background-color;

      &:hover:not(&--disabled),
      &:focus:not(&--disabled) {
        --input-border-color: #{$input-active-color};
      }
      &:focus:not(&--disabled) {
        outline: none;
        background-color: rgba($input-active-color, 0.2);
      }

      &--disabled {
        opacity: 0.6;
        cursor: not-allowed;
        pointer-events: none;
        background-color: rgba($input-label-color, 0.1);
      }

      &:empty::before {
        content: '0';
        color: #999;
      }
    }
  }

  &__slider {
    width: 100%;
    margin: 0 auto;
  }

  &:disabled {
    opacity: 0.6;
    pointer-events: none;

    .control-range__label {
      color: rgba($main-font-color, 0.6);
    }

    .control-range__input-label {
      color: rgba($input-label-color, 0.6);
    }
  }
}
</style>
