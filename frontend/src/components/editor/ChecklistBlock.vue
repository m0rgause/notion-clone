<template>
  <div class="relative group">
    <div class="space-y-2">
      <div
        v-for="(item, index) in items"
        :key="index"
        class="flex items-start space-x-2"
      >
        <input
          type="checkbox"
          v-model="item.checked"
          class="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          @change="updateContent"
        />
        <input
          type="text"
          v-model="item.text"
          class="flex-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded px-2 py-1"
          placeholder="List item"
          @input="updateContent"
          @keydown.enter.prevent="addItem(index + 1)"
          @keydown.backspace="handleBackspace($event, index)"
        />
        <button
          @click="removeItem(index)"
          class="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded"
        >
          <XIcon class="h-4 w-4 text-gray-500" />
        </button>
      </div>
    </div>
    
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
// import { TrashIcon, XIcon } from '@heroicons/vue/outline';


interface ChecklistItem {
  checked: boolean;
  text: string;
}

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

const items = ref<ChecklistItem[]>([{ checked: false, text: '' }]);

// Parse content on mount and when it changes
const parseContent = () => {
  try {
    const parsed = JSON.parse(props.block.content);
    items.value = Array.isArray(parsed) ? parsed : [{ checked: false, text: '' }];
  } catch {
    items.value = [{ checked: false, text: '' }];
  }
};

onMounted(parseContent);
watch(() => props.block.content, parseContent);

const updateContent = () => {
  emit('update', props.block.id, JSON.stringify(items.value));
};

const addItem = (index: number) => {
  items.value.splice(index, 0, { checked: false, text: '' });
  updateContent();
  // Focus the new item in the next tick
  setTimeout(() => {
    const inputs = document.querySelectorAll('input[type="text"]');
    if (inputs[index]) {
      (inputs[index] as HTMLInputElement).focus();
    }
  });
};

const removeItem = (index: number) => {
  if (items.value.length > 1) {
    items.value.splice(index, 1);
    updateContent();
  }
};

const handleBackspace = (event: KeyboardEvent, index: number) => {
  const target = event.target as HTMLInputElement;
  if (target.value === '' && items.value.length > 1) {
    event.preventDefault();
    removeItem(index);
    // Focus the previous item
    setTimeout(() => {
      const inputs = document.querySelectorAll('input[type="text"]');
      if (inputs[index - 1]) {
        (inputs[index - 1] as HTMLInputElement).focus();
      }
    });
  }
};
</script>
