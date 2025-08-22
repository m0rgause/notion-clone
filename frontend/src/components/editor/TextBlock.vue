<template>
  <div class="relative group">
    <editor-content
      :editor="editor"
      class="prose max-w-none focus:outline-none"
    />
    <button
      @click="$emit('delete', props.block.id)"
      class="absolute -right-2 -top-2 p-1 rounded-full bg-red-100 text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
    >
      <TrashIcon class="h-4 w-4" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue';
import { useEditor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
// import { TrashIcon } from '@heroicons/vue/outline';

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

const editor = useEditor({
  content: props.block.content,
  extensions: [StarterKit],
  editorProps: {
    attributes: {
      class: 'prose prose-sm focus:outline-none max-w-none'
    }
  },
  onUpdate: ({ editor }) => {
    emit('update', props.block.id, editor.getHTML());
  }
});

onMounted(() => {
  if (editor.value) {
    editor.value.commands.setContent(props.block.content);
  }
});

onBeforeUnmount(() => {
  if (editor.value) {
    editor.value.destroy();
  }
});
</script>

<style>
.ProseMirror {
  min-height: 100px;
  padding: 0.5rem;
}

.ProseMirror p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color: #adb5bd;
  pointer-events: none;
  height: 0;
}
</style>
