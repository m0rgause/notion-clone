<template>
  <div class="relative group">
    <div class="space-y-2">
      <!-- Language Selector -->
      <select
        v-model="language"
        class="block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
        @change="updateContent"
      >
        <option value="">Select language</option>
        <option v-for="lang in languages" :key="lang" :value="lang">
          {{ lang }}
        </option>
      </select>

      <!-- Code Editor -->
      <div class="relative">
        <textarea
          v-model="code"
          class="w-full h-40 px-4 py-3 font-mono text-sm bg-gray-900 text-gray-100 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
          placeholder="Enter your code here..."
          @input="updateContent"
        ></textarea>

        <!-- Copy Button -->
        <button
          @click="copyToClipboard"
          class="absolute top-2 right-2 p-1 text-gray-400 hover:text-white rounded"
          title="Copy to clipboard"
        >
          <template v-if="copied">
            <CheckIcon class="h-5 w-5" />
          </template>
          <template v-else>
            <ClipboardIcon class="h-5 w-5" />
          </template>
        </button>
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
// import { TrashIcon, ClipboardIcon, CheckIcon } from '@heroicons/vue/outline';

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

const languages = [
  'javascript',
  'typescript',
  'python',
  'java',
  'c',
  'cpp',
  'ruby',
  'php',
  'swift',
  'go',
  'rust',
  'sql',
  'html',
  'css',
  'shell',
  'json',
  'yaml',
  'markdown'
];

const language = ref('');
const code = ref('');
const copied = ref(false);

// Parse content on mount and when it changes
const parseContent = () => {
  try {
    const parsed = JSON.parse(props.block.content);
    language.value = parsed.language || '';
    code.value = parsed.code || '';
  } catch {
    language.value = '';
    code.value = '';
  }
};

onMounted(parseContent);
watch(() => props.block.content, parseContent);

const updateContent = () => {
  emit('update', props.block.id, JSON.stringify({
    language: language.value,
    code: code.value
  }));
};

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(code.value);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (err) {
    console.error('Failed to copy:', err);
  }
};
</script>

<style scoped>
textarea {
  tab-size: 2;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}
</style>
