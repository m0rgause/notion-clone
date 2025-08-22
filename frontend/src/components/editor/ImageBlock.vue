<template>
  <div class="relative group">
    <div class="space-y-4">
      <!-- Image URL Input -->
      <div class="flex space-x-2">
        <input
          type="text"
          v-model="imageUrl"
          placeholder="Enter image URL"
          class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
          @input="updateContent"
        />
      </div>

      <!-- Image Preview -->
      <div v-if="imageUrl" class="relative">
        <img
          :src="imageUrl"
          :alt="imageUrl"
          class="max-w-full rounded-lg shadow-sm"
          @error="handleImageError"
        />
        <div
          v-if="imageError"
          class="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg"
        >
          <ExclamationCircleIcon class="h-8 w-8 text-red-500" />
          <span class="ml-2 text-red-600">Failed to load image</span>
        </div>
      </div>
    </div>

    <!-- Delete Button -->
    <button
      @click="$emit('delete', block.id)"
      class="absolute -right-2 -top-2 p-1 rounded-full bg-red-100 text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
    >
      <TrashIcon class="h-4 w-4" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
// import { TrashIcon, ExclamationCircleIcon } from '@heroicons/vue/outline';

const props = defineProps<{
  block: {
    id: string;
    content: string;
  };
}>();

const emit = defineEmits<{
  (e: 'update', blockId: string, content: string): void;
  (e: 'delete', blockId: string): void;
}>();

const imageUrl = ref('');
const imageError = ref(false);

// Parse content on mount and when it changes
const parseContent = () => {
  try {
    const parsed = JSON.parse(props.block.content);
    imageUrl.value = parsed.url || '';
    imageError.value = false;
  } catch {
    imageUrl.value = '';
    imageError.value = false;
  }
};

onMounted(parseContent);
watch(() => props.block.content, parseContent);

const updateContent = () => {
  emit('update', props.block.id, JSON.stringify({ url: imageUrl.value }));
};

const handleImageError = () => {
  imageError.value = true;
};
</script>
