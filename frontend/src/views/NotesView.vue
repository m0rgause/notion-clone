<template>
  <div>
    <div class="flex justify-betwee              <div class="mt-1 flex items-center text-sm text-gray-500">
              <ClockIcon class="h-4 w-4 mr-1" />
              {{ formatDate(note.updatedAt) }}
            </div>s-center mb-6">
      <h1 class="text-2xl font-bold text-foreground">All Notes</h1>
      <button
        @click="showCreateModal = true"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <PlusIcon class="h-5 w-5 mr-2" />
        New Note
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="noteStore.loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="noteStore.error"
      class="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded relative my-4"
    >
      {{ noteStore.error }}
    </div>

    <!-- Empty State -->
    <div
      v-else-if="!noteStore.notes.length"
      class="text-center py-12 bg-card rounded-lg shadow-sm border border-border"
    >
      <h3 class="text-lg font-medium text-foreground mb-2">No notes yet</h3>
      <p class="text-muted-foreground mb-4">Create your first note to get started!</p>
      <button
        @click="showCreateModal = true"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary bg-primary/10 hover:bg-primary/20"
      >
        Create Note
      </button>
    </div>

    <!-- Notes List -->
    <div v-else class="space-y-4">
      <div
        v-for="note in sortedNotes"
        :key="note.id"
        class="bg-card shadow-sm rounded-lg hover:shadow-md transition-shadow duration-200"
      >
        <div class="p-6 flex justify-between items-start">
          <div class="flex-1">
            <router-link
              :to="`/notes/${note.id}`"
              class="text-xl font-semibold text-foreground hover:text-primary"
            >
              {{ note.title || 'Untitled Note' }}
            </router-link>
            <div class="mt-1 flex items-center text-sm text-muted-foreground">
              <ClockIcon class="h-4 w-4 mr-1" />
              {{ formatDate(note.updatedAt) }}
              <DocumentTextIcon class="h-4 w-4 ml-4 mr-1" />
              {{ note.blocks.length }} blocks
            </div>
          </div>
          
          <!-- Actions -->
          <div class="ml-4 flex items-center space-x-2">
            <button
              @click.prevent="confirmDelete(note)"
              class="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100"
              title="Delete note"
            >
              <TrashIcon class="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Note Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
      <div class="bg-card rounded-lg p-6 w-full max-w-md border border-border shadow-lg">
        <h2 class="text-xl font-bold mb-4 text-foreground">Create New Note</h2>
        <form @submit.prevent="handleCreateNote">
          <div class="mb-4">
            <label for="title" class="block text-sm font-medium text-muted-foreground mb-1">
              Title
            </label>
            <input
              id="title"
              v-model="newNoteTitle"
              type="text"
              required
              class="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-input"
              placeholder="Enter note title"
            />
          </div>
          <div class="flex justify-end space-x-3">
            <button
              type="button"
              @click="showCreateModal = false"
              class="px-4 py-2 text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="creating"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
            >
              <span v-if="creating">Creating...</span>
              <span v-else>Create Note</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 class="text-xl font-bold mb-4">Delete Note</h2>
        <p class="text-gray-600 mb-6">
          Are you sure you want to delete "{{ noteToDelete?.title || 'Untitled Note' }}"? This action cannot be undone.
        </p>
        <div class="flex justify-end space-x-3">
          <button
            @click="showDeleteModal = false"
            class="px-4 py-2 text-gray-700 hover:text-gray-900"
          >
            Cancel
          </button>
          <button
            @click="handleDeleteNote"
            :disabled="deleting"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
          >
            <span v-if="deleting">Deleting...</span>
            <span v-else>Delete Note</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useNoteStore } from '../stores/note';
import {
  PlusIcon,
  TrashIcon,
  ClockIcon,
} from '@heroicons/vue/24/outline';

const router = useRouter();
const noteStore = useNoteStore();

const showCreateModal = ref(false);
const showDeleteModal = ref(false);
const newNoteTitle = ref('');
const creating = ref(false);
const deleting = ref(false);
const noteToDelete = ref<any>(null);

// Sort notes by last updated
const sortedNotes = computed(() => {
  return [...noteStore.notes].sort((a, b) => {
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
});

onMounted(async () => {
  try {
    await noteStore.fetchNotes();
  } catch (error) {
    console.error('Failed to fetch notes:', error);
  }
});

const formatDate = (date: string) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
};

const handleCreateNote = async () => {
  creating.value = true;
  try {
    const note = await noteStore.createNote(newNoteTitle.value);
    showCreateModal.value = false;
    newNoteTitle.value = '';
    router.push(`/notes/${note.id}`);
  } catch (error) {
    console.error('Failed to create note:', error);
  } finally {
    creating.value = false;
  }
};

const confirmDelete = (note: any) => {
  noteToDelete.value = note;
  showDeleteModal.value = true;
};

const handleDeleteNote = async () => {
  if (!noteToDelete.value) return;
  
  deleting.value = true;
  try {
    await noteStore.deleteNote(noteToDelete.value.id);
    showDeleteModal.value = false;
    noteToDelete.value = null;
  } catch (error) {
    console.error('Failed to delete note:', error);
  } finally {
    deleting.value = false;
  }
};
</script>
