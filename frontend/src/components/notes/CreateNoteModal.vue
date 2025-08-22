<template>
  <Dialog :open="modelValue" @update:open="$emit('update:modelValue', $event)">
    <DialogContent class=" sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle class="text-gradient text-2xl">Create New Note</DialogTitle>
        <DialogDescription>
          Give your note a title to get started. You can always change it later.
        </DialogDescription>
      </DialogHeader>
      <form @submit.prevent="handleCreate">
        <div class="grid gap-4 py-4">
          <div class="space-y-2">
            <Label for="title" class="text-foreground">Title</Label>
            <Input
              id="title"
              v-model="noteTitle"
              placeholder="Enter your note title..."
              class="glass-effect"
              :disabled="creating"
              required
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            @click="$emit('update:modelValue', false)"
            :disabled="creating"
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            :disabled="creating"
            class="relative group overflow-hidden"
          >
            <span class="relative z-10 flex items-center gap-2">
              {{ creating ? 'Creating...' : 'Create Note' }}
              <DocumentPlusIcon v-if="!creating" class="h-4 w-4" />
              <span v-else class="animate-spin">⌛</span>
            </span>
            <div class="absolute inset-0 bg-gradient-to-r from-primary to-secondary transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"/>
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useNoteStore } from '@/stores/note';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DocumentPlusIcon } from '@heroicons/vue/24/outline';

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'created', noteId: string): void;
}>();

const router = useRouter();
const noteStore = useNoteStore();

const noteTitle = ref('');
const creating = ref(false);

const handleCreate = async () => {
  if (!noteTitle.value.trim()) return;

  creating.value = true;
  try {
    const note = await noteStore.createNote(noteTitle.value);
    emit('update:modelValue', false);
    emit('created', note.id);
    noteTitle.value = '';
    router.push(`/notes/${note.id}`);
  } catch (error) {
    console.error('Failed to create note:', error);
  } finally {
    creating.value = false;
  }
};
</script>
