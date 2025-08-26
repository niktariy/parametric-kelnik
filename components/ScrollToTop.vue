<script setup lang="ts">
const isVisible = ref(false)

function checkScrollPosition() {
  isVisible.value = window.scrollY > 300
}

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}

onMounted(() => {
  window.addEventListener('scroll', checkScrollPosition)
  checkScrollPosition()
})

onUnmounted(() => {
  window.removeEventListener('scroll', checkScrollPosition)
})
</script>

<template>
  <Transition name="scroll-to-top">
    <UiButton
      v-if="isVisible"
      class="scroll-to-top"
      aria-label="Наверх"
      variant="solid"
      size="small"
      @click="scrollToTop"
    >
      <template #leadingIcon>
        <Icon
          name="mingcute:arrow-up-fill"
          style="color: currentColor"
        />
      </template>
    </UiButton>
  </Transition>
</template>

<style lang="scss" scoped>
@use 'sass:map';

.scroll-to-top {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 2.5rem;
  height: 2.5rem;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1000;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: $element-background-shadow;
    border-radius: inherit;
    z-index: -1;
  }

  &:hover {
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
}

.scroll-to-top-enter-active,
.scroll-to-top-leave-active {
  transition: all 0.3s ease;
}

.scroll-to-top-enter-from,
.scroll-to-top-leave-to {
  opacity: 0;
  transform: translateY(1.25rem);
}
</style>
