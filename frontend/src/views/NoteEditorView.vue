<template>
  <div class="container mx-auto px-4 py-6 space-y-8">
    <!-- Header with Note Title and Collaborators -->
    <div class="relative">
      <div class="absolute inset-0 bg-gradient-blur rounded-lg"></div>
      <div class="glass-effect rounded-lg relative">
        <div class="p-6 space-y-4">
          <div class="flex justify-between items-center gap-4">
            <div class="flex-1 space-y-2">
              <Input
                v-model="title"
                type="text"
                class="text-3xl font-bold w-full bg-transparent border-none hover:bg-background/50 focus:bg-background/50 transition-colors duration-200"
                :class="{'text-gradient': title}"
                placeholder="Untitled"
                @blur="handleTitleUpdate"
              />
              <p class="text-sm text-muted-foreground flex items-center gap-2">
                <ClockIcon class="h-4 w-4" />
                Last updated: {{ noteStore.currentNote?.updatedAt ? new Date(noteStore.currentNote.updatedAt).toLocaleString() : 'N/A' }}
              </p>
            </div>
            
            <!-- Active Users -->
            <div class="flex items-center -space-x-2">
              <div v-for="user in activeUsers" :key="user.id" 
                class="relative group">
                <div class="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full blur-md opacity-0 group-hover:opacity-50 transition-opacity"></div>
                <Avatar class="relative border-2 border-background hover:scale-110 transition-transform">
                  <AvatarFallback class="bg-primary/10 text-primary font-medium">
                    {{ user.email[0].toUpperCase() }}
                  </AvatarFallback>
                </Avatar>
                <Tooltip>
                  <TooltipTrigger>
                    <span class="sr-only">{{ user.email }}</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{{ user.email }}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="noteStore.loading" class="flex justify-center py-8">
      <div class="relative">
        <div class="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full blur-lg opacity-20 animate-pulse"></div>
        <div class="relative animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="noteStore.error" 
      class="glass-effect border-destructive text-destructive p-4 rounded-lg animate-in slide-in-from-top-4 fade-in-20"
    >
      <Alert variant="destructive">
        <AlertTitle class="font-semibold">Error</AlertTitle>
        <AlertDescription>
          {{ noteStore.error }}
        </AlertDescription>
      </Alert>
    </div>

    <!-- Editor -->
    <div v-else class="space-y-4 max-w-4xl mx-auto">
      <TiptapEditor
        :content="noteStore.currentNote?.content"
        :autofocus="true"
        @update="handleContentUpdate"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRoute } from 'vue-router';
import { useNoteStore } from '../stores/note';
import { useSocket } from '../composables/useSocket';
import { Input } from '@/components/ui/input';
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from '@/components/ui/alert';
import {
  Avatar,
  AvatarFallback,
} from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ClockIcon } from '@heroicons/vue/24/outline';
import TiptapEditor from '../components/editor/TiptapEditor.vue';



// Component state
const route = useRoute();
const noteStore = useNoteStore();
const { socket, activeUsers, joinNote, leaveNote } = useSocket();

const noteId = route.params.id as string;
const title = ref('');

// Load note data
onMounted(async () => {
  try {
    const note = await noteStore.fetchNote(noteId);
    title.value = note.title;
    joinNote(noteId);

    // Listen for real-time updates
    socket.value?.on('content-updated', (data: { content: string }) => {
      if (noteStore.currentNote) {
        noteStore.currentNote.content = data.content;
      }
    });

    socket.value?.on('title-updated', (data: { title: string }) => {
      if (noteStore.currentNote) {
        noteStore.currentNote.title = data.title;
        title.value = data.title;
      }
    });
  } catch (error) {
    console.error('Failed to load note:', error);
  }
});

onBeforeUnmount(() => {
  leaveNote(noteId);
});

// Handle title update
const handleTitleUpdate = async () => {
  try {
    await noteStore.updateNote(noteId, { title: title.value });
    // Emit socket event for real-time updates
    socket.value?.emit('update-title', { noteId, title: title.value });
  } catch (error) {
    console.error('Failed to update title:', error);
  }
};

// Handle content update
const handleContentUpdate = async (html: string) => {
  try {
    await noteStore.updateNote(noteId, { content: html });
    // Emit socket event for real-time updates
    socket.value?.emit('update-content', { noteId, content: html });
  } catch (error) {
    console.error('Failed to update content:', error);
  }
};
</script>

<style scoped>
.drag-handle {
  transition: opacity 0.2s;
}
</style>
