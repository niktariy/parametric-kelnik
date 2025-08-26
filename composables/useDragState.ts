import { onMounted, onUnmounted, ref } from 'vue'

export function useDragState() {
  const isDragging = ref(false)

  const handlePointerDown = () => {
    isDragging.value = true
  }

  const handlePointerUp = () => {
    if (isDragging.value) {
      isDragging.value = false
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

  return { isDragging, handlePointerDown, handlePointerUp }
}
