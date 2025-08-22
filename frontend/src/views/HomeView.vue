<template>
  <div class="container mx-auto px-4 py-12">
    <div class="max-w-4xl mx-auto">
      <!-- Welcome Section -->
      <div class="relative mb-12">
        <div class="absolute inset-0 bg-gradient-blur rounded-lg"></div>
        <div class="glass-effect rounded-lg p-8 relative">
          <div class="space-y-4">
            <h1 class="text-4xl font-bold text-gradient">
              Welcome to Mini Notion
            </h1>
            <p class="text-xl text-muted-foreground leading-relaxed">
              Your personal space for capturing ideas, organizing thoughts, and creating beautiful documents.
            </p>
            <div class="flex items-center gap-4 pt-4">
              <Button 
                @click="createNewNote"
                size="lg"
                class="relative group overflow-hidden"
              >
                <span class="relative z-10 flex items-center gap-2">
                  <PlusIcon class="h-5 w-5" />
                  New Note
                </span>
                <div 
                  class="absolute inset-0 bg-gradient-to-r from-primary/80 to-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />
              </Button>
             
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card class="glass-effect hover-glass-effect">
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <DocumentTextIcon class="h-5 w-5" />
              Total Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p class="text-3xl font-bold text-gradient">{{ noteStore.notes.length }}</p>
          </CardContent>
        </Card>

        <Card class="glass-effect hover-glass-effect">
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <ClockIcon class="h-5 w-5" />
              Last Updated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p class="text-muted-foreground">
              {{ lastUpdatedNote ? new Date(lastUpdatedNote.updatedAt).toLocaleString() : 'No notes yet' }}
            </p>
          </CardContent>
        </Card>

      </div>

    </div>
  </div>

  <CreateNoteModal 
    v-model="showCreateModal"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useNoteStore } from '../stores/note';
import CreateNoteModal from '@/components/notes/CreateNoteModal.vue';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  PlusIcon,
  DocumentTextIcon,
  ClockIcon,
} from '@heroicons/vue/24/outline';
import { 
  Blocks, 
  Keyboard as KeyboardIcon,
} from 'lucide-vue-next';

const router = useRouter();
const noteStore = useNoteStore();

const lastUpdatedNote = computed(() => {
  if (!noteStore.notes.length) return null;
  return [...noteStore.notes].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )[0];
});


const showCreateModal = ref(false);

const createNewNote = () => {
  showCreateModal.value = true;
};

onMounted(async () => {
  try {
    await noteStore.fetchNotes();
  } catch (error) {
    console.error('Failed to fetch notes:', error);
  }
});
</script>
