<script setup lang="ts">
interface CheckboxProps {
  modelValue: string[]
  controlValue: string
  label: string
  disabled?: boolean
}
const props = defineProps<CheckboxProps>()

const emit = defineEmits(['update:modelValue'])

const checkboxId = computed(
  () => `checkbox-${props.controlValue + props.label}`,
)

const selected = computed(() =>
  props.modelValue.includes(props.controlValue),
)

function onChange(event: Event) {
  const checked = (event.target as HTMLInputElement).checked
  let newValue = [...props.modelValue]

  if (checked && !newValue.includes(props.controlValue)) {
    newValue.push(props.controlValue)
  }
  else if (!checked) {
    newValue = newValue.filter(v => v !== props.controlValue)
  }

  emit('update:modelValue', newValue)
}
</script>

<template>
  <div
    class="control-checkbox"
    :class="[{ 'control-checkbox--disabled': disabled }]"
    :aria-disabled="disabled"
  >
    <input
      :id="checkboxId"
      class="control-checkbox__input sr-only"
      type="checkbox"
      :disabled="disabled"
      :value="controlValue"
      :checked="selected"
      @change="onChange"
    >
    <label
      class="control-checkbox__label"
      :for="checkboxId"
    >
      {{ label }}
    </label>
  </div>
</template>

<style lang="scss" scoped>
  @use 'sass:map';

.control-checkbox {
  $checkbox-background-map: map.get($control-checkbox-colors, 'background');
  $checkbox-text-map: map.get($control-checkbox-colors, 'text');

  --control-background: #{map.get($checkbox-background-map, 'default')};
  --control-text: #{map.get($checkbox-text-map, 'default')};
  --control-shadow-color: #{map.get($control-checkbox-colors, 'shadow', 'selected')};
  --control-shadow: none;

  &:hover:not(&--disabled) {
    --control-background: #{map.get($checkbox-background-map, 'hover')};
    --control-text: #{map.get($checkbox-text-map, 'hover')};
    --control-shadow-color: #{map.get($control-checkbox-colors, 'shadow', 'hover')};
    --control-shadow: 0 2px 10px 0;
  }

  &__input:active + &__label {
    transform: scale(1.05);
  }

  &__input:checked + &__label {
    --control-background: #{map.get($checkbox-background-map, 'selected')};
    --control-text: #{map.get($checkbox-text-map, 'selected')};
    --control-shadow: 0 6px 20px 0;
  }

  &--disabled,
  &__input:disabled + &__label {
    --control-background: #{map.get($checkbox-background-map, 'disabled')};
    --control-text: #{map.get($checkbox-text-map, 'disabled')};
    --control-shadow: unset;
    cursor: not-allowed;
    pointer-events: none;
    user-select: none;
  }

  &:focus-within {
    --control-shadow-color: #{map.get($control-checkbox-colors, 'shadow', 'focus')};
    --control-shadow: 0 2px 20px 0;
  }

  &__input:focus-visible + &__label {
    outline: 2px solid map.get($checkbox-background-map, 'selected');
    outline-offset: 2px;
  }

  &__label {
    display: flex;
    justify-content: center;
    width: 44px;
    height: 44px;
    padding: 10px 12px;
    font-size: 16px;
    text-align: center;
    background-color: var(--control-background);
    border-radius: map.get($radius, 'round');
    box-shadow: var(--control-shadow) var(--control-shadow-color);
    color: var(--control-text);
    cursor: pointer;
    transition: all ease-in 0.2s;
  }
}
</style>
