<template>
  <div class="tiptap-editor">
    <editor-content :editor="editor" class="prose prose-sm dark:prose-invert max-w-none" />
    
    <!-- Editor Menu Bar -->
    <div v-if="editor" class="fixed bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 px-3 py-2 border rounded-lg bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-lg">
      <Button
        variant="ghost"
        size="sm"
        :class="{ 'bg-muted': editor.isActive('heading', { level: 1 }) }"
        @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
      >
        <Heading1 class="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        :class="{ 'bg-muted': editor.isActive('heading', { level: 2 }) }"
        @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
      >
        <Heading2 class="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        :class="{ 'bg-muted': editor.isActive('bold') }"
        @click="editor.chain().focus().toggleBold().run()"
      >
        <Bold class="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        :class="{ 'bg-muted': editor.isActive('italic') }"
        @click="editor.chain().focus().toggleItalic().run()"
      >
        <Italic class="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        :class="{ 'bg-muted': editor.isActive('strike') }"
        @click="editor.chain().focus().toggleStrike().run()"
      >
        <Strikethrough class="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" class="h-6" />

      <Button
        variant="ghost"
        size="sm"
        :class="{ 'bg-muted': editor.isActive('bulletList') }"
        @click="editor.chain().focus().toggleBulletList().run()"
      >
        <List class="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        :class="{ 'bg-muted': editor.isActive('orderedList') }"
        @click="editor.chain().focus().toggleOrderedList().run()"
      >
        <ListOrdered class="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        :class="{ 'bg-muted': editor.isActive('taskList') }"
        @click="editor.chain().focus().toggleTaskList().run()"
      >
        <ListTodo class="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" class="h-6" />

      <Button
        variant="ghost"
        size="sm"
        :class="{ 'bg-muted': editor.isActive('codeBlock') }"
        @click="editor.chain().focus().toggleCodeBlock().run()"
      >
        <Code2 class="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        @click="addImage"
      >
        <ImageIcon class="h-4 w-4" />
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {  onBeforeUnmount, watch } from 'vue';
import { useEditor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Image from '@tiptap/extension-image';
import { common, createLowlight } from 'lowlight';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  ListTodo,
  Code2,
  Image as ImageIcon
} from 'lucide-vue-next';

const props = defineProps<{
  content?: string;
  autofocus?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update', html: string): void;
}>();

// Initialize editor
const lowlight = createLowlight(common);

const editor = useEditor({
  content: props.content,
  autofocus: props.autofocus,
  extensions: [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3]
      },
    }),
    TaskList,
    TaskItem.configure({
      nested: true,
    }),
    Image,
    CodeBlockLowlight.configure({
      lowlight,
    }),
  ],
  editorProps: {
    attributes: {
      class: 'prose prose-sm dark:prose-invert focus:outline-none max-w-none'
    }
  },
  onUpdate: ({ editor }) => {
    emit('update', editor.getHTML());
  }
});

// Add image from URL
const addImage = () => {
  const url = window.prompt('Enter image URL');
  if (url) {
    editor.value?.chain().focus().setImage({ src: url }).run();
  }
};

// Watch for content changes from parent
watch(() => props.content, (newContent) => {
  const isSame = editor.value?.getHTML() === newContent;
  if (newContent && !isSame) {
    editor.value?.commands.setContent(newContent, {
      emitUpdate: false
    });
  }
});

// Cleanup
onBeforeUnmount(() => {
  editor.value?.destroy();
});
</script>

<style>
/* Editor Styles */
.tiptap-editor :where(h1) {
  font-size: 1.875rem;
  line-height: 2.25rem;
  font-weight: 700;
  margin-bottom: 1rem;
  margin-top: 1.5rem;
}

.tiptap-editor :where(h2) {
  font-size: 1.5rem;
  line-height: 2rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  margin-top: 1.25rem;
}

.tiptap-editor :where(p) {
  margin-bottom: 0.75rem;
  line-height: 1.625;
}

.tiptap-editor :where(ul, ol) {
  margin-bottom: 0.75rem;
  margin-left: 1.5rem;
}

.tiptap-editor :where(li) {
  margin-bottom: 0.25rem;
}

.tiptap-editor :where(pre) {
  padding: 1rem;
  border-radius: 0.5rem;
  background-color: hsl(var(--muted) / 0.5);
  margin-bottom: 0.75rem;
  overflow-x: auto;
}

.tiptap-editor :where(code) {
  font-family: ui-monospace, monospace;
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.tiptap-editor :where(img) {
  max-width: 100%;
  border-radius: 0.5rem;
  margin-top: 1rem;
  margin-bottom: 1rem;
}

.tiptap-editor :where(.task-list) {
  list-style: none;
  margin-left: 0;
}

.tiptap-editor :where(.task-list-item) {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.tiptap-editor :where(.task-list-item input[type="checkbox"]) {
  margin-top: 0.25rem;
}

/* Placeholder */
.tiptap-editor .is-empty::before {
  content: attr(data-placeholder);
  color: hsl(var(--muted-foreground));
  float: left;
  height: 0;
  pointer-events: none;
}
</style>
