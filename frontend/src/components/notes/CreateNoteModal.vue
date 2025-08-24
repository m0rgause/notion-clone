<template>
  <Dialog :open="modelValue" @update:open="$emit('update:modelValue', $event)">
    <DialogContent
      class="sm:max-w-md p-0 bg-white border-0 shadow-xl rounded-xl overflow-hidden"
    >
      <!-- Header -->
      <div class="px-6 py-5 border-b border-gray-100">
        <div class="flex items-center justify-between">
          <div>
            <DialogTitle class="text-lg font-semibold text-gray-900">
              Create a new page
            </DialogTitle>
            <DialogDescription class="text-sm text-gray-500 mt-1">
              Start writing and organizing your thoughts
            </DialogDescription>
          </div>
        </div>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleCreate" class="px-6 py-5">
        <div class="space-y-4">
          <div>
            <Label
              for="title"
              class="text-sm font-medium text-gray-700 mb-2 block"
            >
              Page title
            </Label>
            <Input
              id="title"
              v-model="noteTitle"
              placeholder="Untitled"
              class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
              :disabled="creating"
              required
              autofocus
            />
          </div>
        </div>

        <!-- Footer -->
        <div
          class="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-gray-100"
        >
          <Button
            type="button"
            variant="ghost"
            @click="$emit('update:modelValue', false)"
            :disabled="creating"
            class="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            :disabled="creating || !noteTitle.trim()"
            class="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all inline-flex items-center space-x-2"
          >
            <span>{{ creating ? "Creating..." : "Create page" }}</span>
            <svg
              v-if="!creating"
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            <div
              v-else
              class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
            ></div>
          </Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useNoteStore } from "@/stores/note";
import { useToast } from "@/composables/useToast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "created", note: any): void;
}>();

const noteStore = useNoteStore();
const { success, error } = useToast();

const noteTitle = ref("");
const creating = ref(false);

const handleCreate = async () => {
  if (!noteTitle.value.trim()) return;

  creating.value = true;
  try {
    const note = await noteStore.createNote(noteTitle.value);

    // Show success toast
    success(`Page "${noteTitle.value}" created successfully!`);

    // Close modal immediately
    emit("update:modelValue", false);

    // Clear form
    noteTitle.value = "";

    // Delay emitting the created event to allow toast to show
    setTimeout(() => {
      emit("created", note);
    }, 500);
  } catch (err) {
    console.error("Failed to create note:", err);
    error("Failed to create page. Please try again.");
  } finally {
    creating.value = false;
  }
};
</script>
