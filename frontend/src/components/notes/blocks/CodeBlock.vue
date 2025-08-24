<template>
  <div class="code-block">
    <div class="code-header flex items-center justify-between bg-gray-800 text-white px-4 py-2 rounded-t-lg">
      <select
        v-model="selectedLanguage"
        @change="updateContent"
        class="bg-gray-700 text-white text-sm rounded px-2 py-1 border-none outline-none"
      >
        <option value="javascript">JavaScript</option>
        <option value="typescript">TypeScript</option>
        <option value="python">Python</option>
        <option value="java">Java</option>
        <option value="cpp">C++</option>
        <option value="html">HTML</option>
        <option value="css">CSS</option>
        <option value="json">JSON</option>
        <option value="sql">SQL</option>
        <option value="bash">Bash</option>
        <option value="plaintext">Plain Text</option>
      </select>
      <button
        @click="copyCode"
        class="text-gray-300 hover:text-white transition-colors"
        title="Copy code"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      </button>
    </div>
    <div class="code-content bg-gray-900 rounded-b-lg">
      <textarea
        v-model="codeContent"
        @input="updateContent"
        placeholder="Enter your code here..."
        class="w-full h-32 bg-transparent text-green-400 font-mono text-sm p-4 border-none outline-none resize-y"
        spellcheck="false"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

interface CodeData {
  language: string
  code: string
}

interface Props {
  content: string
}

interface Emits {
  (e: 'update', content: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const selectedLanguage = ref('javascript')
const codeContent = ref('')

// Parse content from JSON string
const parseContent = (content: string): CodeData => {
  try {
    if (!content) {
      return { language: 'javascript', code: '' }
    }
    const parsed = JSON.parse(content)
    return {
      language: parsed.language || 'javascript',
      code: parsed.code || ''
    }
  } catch {
    // If it's not JSON, treat it as plain code
    return {
      language: 'plaintext',
      code: content || ''
    }
  }
}

// Initialize values
onMounted(() => {
  const data = parseContent(props.content)
  selectedLanguage.value = data.language
  codeContent.value = data.code
})

// Watch for prop changes
watch(() => props.content, (newContent) => {
  const data = parseContent(newContent)
  if (data.language !== selectedLanguage.value || data.code !== codeContent.value) {
    selectedLanguage.value = data.language
    codeContent.value = data.code
  }
})

const updateContent = () => {
  const data: CodeData = {
    language: selectedLanguage.value,
    code: codeContent.value
  }
  emit('update', JSON.stringify(data))
}

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(codeContent.value)
    // Could show a toast notification here
  } catch (err) {
    console.error('Failed to copy code:', err)
  }
}
</script>

<style scoped>
.code-block {
  min-height: 2rem;
  width: 100%;
  margin: 0.5rem 0;
}

.code-content textarea {
  font-family: 'Courier New', 'Monaco', 'Menlo', monospace;
  line-height: 1.5;
}

.code-content textarea::placeholder {
  color: #6b7280;
}
</style>
