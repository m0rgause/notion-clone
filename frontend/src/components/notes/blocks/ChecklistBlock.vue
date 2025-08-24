<template>
  <div class="checklist-block">
    <div class="checklist-items space-y-2">
      <div 
        v-for="(item, index) in checklistItems" 
        :key="index"
        class="flex items-center space-x-2"
      >
        <input
          type="checkbox"
          :checked="item.checked"
          @change="toggleItem(index)"
          class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
        />
        <input
          v-model="item.text"
          @input="updateContent"
          @keydown.enter.prevent="addNewItem(index)"
          @keydown.backspace="handleBackspace(index, $event)"
          placeholder="Add a task..."
          class="flex-1 border-none outline-none bg-transparent text-gray-900 placeholder-gray-400"
        />
        <button
          v-if="checklistItems.length > 1"
          @click="removeItem(index)"
          class="text-gray-400 hover:text-red-500 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

interface ChecklistItem {
  text: string
  checked: boolean
}

interface Props {
  content: string
}

interface Emits {
  (e: 'update', content: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const checklistItems = ref<ChecklistItem[]>([])

// Parse content from JSON string
const parseContent = (content: string) => {
  try {
    if (!content) {
      return [{ text: '', checked: false }]
    }
    const parsed = JSON.parse(content)
    return Array.isArray(parsed) && parsed.length > 0 
      ? parsed 
      : [{ text: '', checked: false }]
  } catch {
    return [{ text: content || '', checked: false }]
  }
}

// Initialize checklist items
onMounted(() => {
  checklistItems.value = parseContent(props.content)
})

// Watch for prop changes
watch(() => props.content, (newContent) => {
  const newItems = parseContent(newContent)
  if (JSON.stringify(newItems) !== JSON.stringify(checklistItems.value)) {
    checklistItems.value = newItems
  }
})

const updateContent = () => {
  const content = JSON.stringify(checklistItems.value)
  emit('update', content)
}

const toggleItem = (index: number) => {
  checklistItems.value[index].checked = !checklistItems.value[index].checked
  updateContent()
}

const addNewItem = (index: number) => {
  checklistItems.value.splice(index + 1, 0, { text: '', checked: false })
  updateContent()
  // Focus the new input in the next tick
  setTimeout(() => {
    const inputs = document.querySelectorAll('.checklist-block input[type="text"]')
    const newInput = inputs[index + 1] as HTMLInputElement
    if (newInput) {
      newInput.focus()
    }
  }, 0)
}

const removeItem = (index: number) => {
  if (checklistItems.value.length > 1) {
    checklistItems.value.splice(index, 1)
    updateContent()
  }
}

const handleBackspace = (index: number, event: KeyboardEvent) => {
  const input = event.target as HTMLInputElement
  if (input.value === '' && checklistItems.value.length > 1) {
    removeItem(index)
    // Focus the previous input
    setTimeout(() => {
      const inputs = document.querySelectorAll('.checklist-block input[type="text"]')
      const prevInput = inputs[Math.max(0, index - 1)] as HTMLInputElement
      if (prevInput) {
        prevInput.focus()
      }
    }, 0)
  }
}
</script>

<style scoped>
.checklist-block {
  min-height: 2rem;
  width: 100%;
  padding: 0.5rem;
}
</style>
