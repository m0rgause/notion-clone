<template>
  <div class="image-block">
    <div v-if="imageUrl" class="image-container">
      <img 
        :src="imageUrl" 
        :alt="altText || 'Image'"
        class="max-w-full h-auto rounded-lg shadow-sm"
        @error="handleImageError"
      />
      <div class="image-actions mt-2 flex space-x-2">
        <button
          @click="editImageUrl"
          class="text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          Edit URL
        </button>
        <button
          @click="removeImage"
          class="text-sm text-red-600 hover:text-red-800 transition-colors"
        >
          Remove
        </button>
      </div>
    </div>
    <div v-else class="image-input">
      <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <div class="mt-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Image URL
          </label>
          <input
            v-model="urlInput"
            @keydown.enter.prevent="addImage"
            type="url"
            placeholder="https://example.com/image.jpg"
            class="block w-full border border-gray-300 rounded-md px-3 py-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            @click="addImage"
            :disabled="!urlInput.trim()"
            class="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Image
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface ImageData {
  url: string
  alt?: string
}

interface Props {
  content: string
}

interface Emits {
  (e: 'update', content: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const urlInput = ref('')

// Parse content from JSON string
const imageData = computed(() => {
  try {
    if (!props.content) return null
    const parsed = JSON.parse(props.content)
    return parsed && parsed.url ? parsed : null
  } catch {
    // If it's not JSON, treat it as a plain URL
    return props.content ? { url: props.content, alt: '' } : null
  }
})

const imageUrl = computed(() => imageData.value?.url || '')
const altText = computed(() => imageData.value?.alt || '')

const updateContent = (data: ImageData | null) => {
  const content = data ? JSON.stringify(data) : ''
  emit('update', content)
}

const addImage = () => {
  if (urlInput.value.trim()) {
    updateContent({
      url: urlInput.value.trim(),
      alt: ''
    })
    urlInput.value = ''
  }
}

const editImageUrl = () => {
  urlInput.value = imageUrl.value
  updateContent(null)
}

const removeImage = () => {
  updateContent(null)
}

const handleImageError = () => {
  // Could show an error message or placeholder
  console.error('Failed to load image:', imageUrl.value)
}
</script>

<style scoped>
.image-block {
  min-height: 2rem;
  width: 100%;
  padding: 0.5rem;
}

.image-container img {
  max-height: 400px;
  object-fit: contain;
}
</style>
