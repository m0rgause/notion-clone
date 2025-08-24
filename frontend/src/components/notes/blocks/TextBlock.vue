<template>
  <div class="text-block">
    <div v-if="editor" class="editor-wrapper">
      <!-- Toolbar -->
      <div
        v-if="isFocused || isEditorFocused || isToolbarHovered"
        class="toolbar bg-white border border-gray-200 rounded-lg shadow-lg p-2 mb-2 flex items-center space-x-1"
        @mouseenter="isToolbarHovered = true"
        @mouseleave="isToolbarHovered = false"
      >
        <!-- Bold -->
        <button
          @click="editor.chain().focus().toggleBold().run()"
          :class="[
            'p-2 rounded hover:bg-gray-100 transition-colors',
            { 'bg-gray-200': editor.isActive('bold') },
          ]"
          title="Bold"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              d="M5 3a1 1 0 000 2h1v10H5a1 1 0 100 2h6a4 4 0 001.874-7.528A3.5 3.5 0 0010.5 3H5zm5 6H8V5h2a1.5 1.5 0 110 3zm.5 2a2.5 2.5 0 110 5H8v-5h2.5z"
            />
          </svg>
        </button>

        <!-- Italic -->
        <button
          @click="editor.chain().focus().toggleItalic().run()"
          :class="[
            'p-2 rounded hover:bg-gray-100 transition-colors',
            { 'bg-gray-200': editor.isActive('italic') },
          ]"
          title="Italic"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              d="M8 3a1 1 0 000 2h1.5l-2 12H6a1 1 0 100 2h5a1 1 0 100-2H9.5l2-12H13a1 1 0 100-2H8z"
            />
          </svg>
        </button>

        <!-- Underline -->
        <button
          @click="editor.chain().focus().toggleUnderline().run()"
          :class="[
            'p-2 rounded hover:bg-gray-100 transition-colors',
            { 'bg-gray-200': editor.isActive('underline') },
          ]"
          title="Underline"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              d="M6 3a1 1 0 000 2v6a4 4 0 008 0V5a1 1 0 100-2H6zm2 2h4v6a2 2 0 11-4 0V5zm-1 10a1 1 0 000 2h6a1 1 0 100-2H7z"
            />
          </svg>
        </button>

        <!-- Separator -->
        <div class="w-px h-6 bg-gray-300"></div>

        <!-- Heading 1 -->
        <button
          @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
          :class="[
            'px-3 py-2 rounded hover:bg-gray-100 transition-colors text-sm font-medium',
            { 'bg-gray-200': editor.isActive('heading', { level: 1 }) },
          ]"
          title="Heading 1"
        >
          H1
        </button>

        <!-- Heading 2 -->
        <button
          @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
          :class="[
            'px-3 py-2 rounded hover:bg-gray-100 transition-colors text-sm font-medium',
            { 'bg-gray-200': editor.isActive('heading', { level: 2 }) },
          ]"
          title="Heading 2"
        >
          H2
        </button>

        <!-- Heading 3 -->
        <button
          @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
          :class="[
            'px-3 py-2 rounded hover:bg-gray-100 transition-colors text-sm font-medium',
            { 'bg-gray-200': editor.isActive('heading', { level: 3 }) },
          ]"
          title="Heading 3"
        >
          H3
        </button>

        <!-- Separator -->
        <div class="w-px h-6 bg-gray-300"></div>

        <!-- Bullet List -->
        <button
          @click="editor.chain().focus().toggleBulletList().run()"
          :class="[
            'p-2 rounded hover:bg-gray-100 transition-colors',
            { 'bg-gray-200': editor.isActive('bulletList') },
          ]"
          title="Bullet List"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              d="M3 4a1 1 0 100 2h.01a1 1 0 100-2H3zM8 5a1 1 0 000 2h8a1 1 0 100-2H8zM3 10a1 1 0 100 2h.01a1 1 0 100-2H3zM8 11a1 1 0 100 2h8a1 1 0 100-2H8zM3 16a1 1 0 100 2h.01a1 1 0 100-2H3zM8 17a1 1 0 100 2h8a1 1 0 100-2H8z"
            />
          </svg>
        </button>

        <!-- Numbered List -->
        <button
          @click="editor.chain().focus().toggleOrderedList().run()"
          :class="[
            'p-2 rounded hover:bg-gray-100 transition-colors',
            { 'bg-gray-200': editor.isActive('orderedList') },
          ]"
          title="Numbered List"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              d="M3 4a1 1 0 01.4-.8l1-1a1 1 0 011.2 0l1 1A1 1 0 017 4v1a1 1 0 11-2 0V4.414L4.414 5 5 5.586 5.586 5 5 4.414V4a1 1 0 01-2 0zm5 1a1 1 0 000 2h8a1 1 0 100-2H8zm0 6a1 1 0 100 2h8a1 1 0 100-2H8zm0 6a1 1 0 100 2h8a1 1 0 100-2H8zM3 10v1a1 1 0 11-2 0v-1a1 1 0 01.4-.8l1-1a1 1 0 011.2 0l1 1a1 1 0 01.4.8v1a1 1 0 11-2 0v-.586L4.414 11 5 10.414l.586.586L5 11.586V11a1 1 0 01-2 0zm0 6v1a1 1 0 11-2 0v-1a1 1 0 01.4-.8l1-1a1 1 0 011.2 0l1 1a1 1 0 01.4.8v1a1 1 0 11-2 0v-.586L4.414 17 5 16.414l.586.586L5 17.586V17a1 1 0 01-2 0z"
            />
          </svg>
        </button>

        <!-- Separator -->
        <div class="w-px h-6 bg-gray-300"></div>

        <!-- Blockquote -->
        <button
          @click="editor.chain().focus().toggleBlockquote().run()"
          :class="[
            'p-2 rounded hover:bg-gray-100 transition-colors',
            { 'bg-gray-200': editor.isActive('blockquote') },
          ]"
          title="Quote"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              d="M8 7V3H6v3l1 1v1a2 2 0 01-2 2H4v2h1a4 4 0 004-4V7zm6 0V3h-2v3l1 1v1a2 2 0 01-2 2h-1v2h1a4 4 0 004-4V7z"
            />
          </svg>
        </button>

        <!-- Code -->
        <button
          @click="editor.chain().focus().toggleCode().run()"
          :class="[
            'p-2 rounded hover:bg-gray-100 transition-colors',
            { 'bg-gray-200': editor.isActive('code') },
          ]"
          title="Inline Code"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10.56 10 6.28 5.22zm7.44 0L9.44 10l4.28 4.28a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06z"
            />
          </svg>
        </button>
      </div>

      <!-- Editor Content -->
      <EditorContent :editor="editor" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import { Editor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";

interface Props {
  content: string;
  placeholder?: string;
  isFocused?: boolean;
}

interface Emits {
  (e: "update", content: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: "Type something...",
  isFocused: false,
});

const emit = defineEmits<Emits>();

const editor = ref<Editor>();
const isEditorFocused = ref(false);
const isToolbarHovered = ref(false);
const blurTimeout = ref<number | null>(null);

onMounted(() => {
  editor.value = new Editor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: props.placeholder,
      }),
      Typography,
    ],
    content: props.content,
    onUpdate: ({ editor }) => {
      emit("update", editor.getHTML());
    },
    onFocus: () => {
      if (blurTimeout.value) {
        clearTimeout(blurTimeout.value);
        blurTimeout.value = null;
      }
      isEditorFocused.value = true;
    },
    onBlur: () => {
      // Delay the blur to allow clicking on toolbar
      blurTimeout.value = setTimeout(() => {
        isEditorFocused.value = false;
      }, 150) as unknown as number;
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none",
      },
    },
  });
});

onBeforeUnmount(() => {
  if (blurTimeout.value) {
    clearTimeout(blurTimeout.value);
  }
  editor.value?.destroy();
});

watch(
  () => props.content,
  (newContent) => {
    if (editor.value && editor.value.getHTML() !== newContent) {
      editor.value.commands.setContent(newContent, { emitUpdate: false });
    }
  }
);
</script>

<style scoped>
.text-block {
  min-height: 2rem;
  width: 100%;
  position: relative;
}

.editor-wrapper {
  width: 100%;
}

.toolbar {
  position: absolute;
  top: -60px;
  left: 0;
  z-index: 10;
  animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

:deep(.ProseMirror) {
  outline: none;
  padding: 0.75rem;
  border-radius: 6px;
  min-height: 3rem;
  border: 2px solid transparent;
  transition: all 0.2s ease;
  line-height: 1.6;
  color: #374151;
  font-size: 16px;
}

:deep(.ProseMirror:focus) {
  border-color: #3b82f6;
  background-color: #fafafa;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

:deep(.ProseMirror p.is-editor-empty:first-child::before) {
  color: #9ca3af;
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}

:deep(.ProseMirror p) {
  margin: 0.5rem 0;
  line-height: 1.6;
}

:deep(.ProseMirror h1) {
  font-size: 2rem;
  font-weight: 700;
  margin: 1rem 0 0.5rem 0;
  color: #111827;
  line-height: 1.3;
}

:deep(.ProseMirror h2) {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0.75rem 0 0.5rem 0;
  color: #111827;
  line-height: 1.4;
}

:deep(.ProseMirror h3) {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0.75rem 0 0.5rem 0;
  color: #111827;
  line-height: 1.4;
}

:deep(.ProseMirror strong) {
  font-weight: 700;
  color: #111827;
}

:deep(.ProseMirror em) {
  font-style: italic;
}

:deep(.ProseMirror u) {
  text-decoration: underline;
}

:deep(.ProseMirror ul, .ProseMirror ol) {
  padding-left: 1.5rem;
  margin: 0.75rem 0;
}

:deep(.ProseMirror li) {
  margin: 0.25rem 0;
  line-height: 1.6;
}

:deep(.ProseMirror blockquote) {
  border-left: 4px solid #3b82f6;
  padding-left: 1rem;
  margin: 1rem 0;
  font-style: italic;
  color: #6b7280;
  background-color: #f8fafc;
  padding: 1rem;
  border-radius: 4px;
}

:deep(.ProseMirror code) {
  background-color: #f1f5f9;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-family:
    "SF Mono", "Monaco", "Cascadia Code", "Roboto Mono", Consolas,
    "Courier New", monospace;
  font-size: 0.875rem;
  color: #dc2626;
  border: 1px solid #e2e8f0;
}

:deep(.ProseMirror pre) {
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 1rem;
  margin: 1rem 0;
  overflow-x: auto;
}

:deep(.ProseMirror pre code) {
  background: none;
  border: none;
  padding: 0;
  color: #374151;
}

/* Focus states for better accessibility */
:deep(.ProseMirror:focus-visible) {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Custom selection */
:deep(.ProseMirror ::selection) {
  background-color: rgba(59, 130, 246, 0.2);
}
</style>
