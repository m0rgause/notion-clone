<template>
  <div class="note-detail-view min-h-screen bg-white">
    <!-- Top Navigation Bar -->
    <div
      class="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100"
    >
      <div class="max-w-5xl mx-auto px-6 py-3">
        <div class="flex items-center justify-between">
          <button
            @click="goBack"
            class="inline-flex items-center text-gray-500 hover:text-gray-900 transition-colors group"
          >
            <svg
              class="w-4 h-4 mr-2 group-hover:-translate-x-0.5 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span class="text-sm font-medium">Back</span>
          </button>

          <div class="flex items-center space-x-4">
            <!-- Active Users -->
            <div
              v-if="activeUsers.length > 0"
              class="flex items-center space-x-2 opacity-60 hover:opacity-100 transition-opacity"
            >
              <div class="flex -space-x-1">
                <div
                  v-for="userId in activeUsers.slice(0, 3)"
                  :key="userId"
                  class="w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium border border-white shadow-sm"
                  :title="`User ${userId}`"
                >
                  {{ userId.substring(0, 1).toUpperCase() }}
                </div>
                <div
                  v-if="activeUsers.length > 3"
                  class="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs font-medium border border-white shadow-sm"
                >
                  +{{ activeUsers.length - 3 }}
                </div>
              </div>
            </div>

            <!-- Share Button -->
            <button
              @click="openShareModal"
              class="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              title="Share note"
            >
              <svg
                class="w-4 h-4 mr-1.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                />
              </svg>
              Share
            </button>

            <!-- Connection Status -->
            <div class="flex items-center space-x-1.5 opacity-60">
              <div
                :class="[
                  'w-1.5 h-1.5 rounded-full',
                  socketConnected ? 'bg-green-400' : 'bg-red-400',
                ]"
              ></div>
              <span class="text-xs text-gray-500 font-medium">
                {{ socketConnected ? "Live" : "Offline" }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center h-96">
      <div class="flex flex-col items-center space-y-4">
        <div
          class="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-gray-600"
        ></div>
        <p class="text-gray-500 text-sm">Loading your note...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex items-center justify-center h-96">
      <div class="text-center">
        <div class="text-6xl mb-4">😕</div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">
          Something went wrong
        </h3>
        <p class="text-gray-500 mb-4">{{ error }}</p>
        <button
          @click="goBack"
          class="inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          Go back to notes
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else-if="note" class="max-w-5xl mx-auto">
      <!-- Note Content Area -->
      <div class="px-6 py-8">
        <!-- Note Title -->
        <div class="mb-8">
          <input
            v-model="noteTitle"
            @input="debouncedUpdateTitle"
            @blur="updateTitle"
            placeholder="Untitled"
            class="w-full text-5xl font-bold text-gray-900 bg-transparent border-none outline-none placeholder-gray-300 resize-none leading-tight tracking-tight"
          />

          <!-- Subtle metadata -->
          <div
            class="flex items-center space-x-3 mt-4 text-sm text-gray-400 opacity-0 hover:opacity-100 transition-opacity duration-300"
          >
            <span
              >{{ note.blocks.length }} block{{
                note.blocks.length !== 1 ? "s" : ""
              }}</span
            >
            <span>•</span>
            <span>Last edited {{ formatDate(note.updatedAt) }}</span>
          </div>
        </div>

        <!-- Block Editor -->
        <div class="prose prose-lg max-w-none">
          <BlockEditor :note-id="note.id" :initial-blocks="note.blocks" />
        </div>
      </div>

      <!-- Bottom spacing -->
      <div class="h-96"></div>
    </div>

    <!-- Share Modal -->
    <ShareNoteModal
      v-model="showShareModal"
      :note-id="noteId"
      :note-title="note?.title || 'Untitled'"
      :owner-email="authStore.user?.email || ''"
      :collaborators="collaborators"
      :is-public="note?.isPublic || false"
      :public-id="note?.publicId"
      @add-collaborator="handleAddCollaborator"
      @remove-collaborator="handleRemoveCollaborator"
      @toggle-public="handleTogglePublic"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useNoteStore } from "@/stores/note";
import { useSocketStore } from "@/stores/socket";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "@/composables/useToast";
import BlockEditor from "@/components/notes/BlockEditor.vue";
import ShareNoteModal from "@/components/notes/ShareNoteModal.vue";

const route = useRoute();
const router = useRouter();
const noteStore = useNoteStore();
const socketStore = useSocketStore();
const authStore = useAuthStore();
const { showToast } = useToast();

const noteTitle = ref("");
const titleUpdateTimeout = ref<number | null>(null);

// Collaboration state
const showShareModal = ref(false);

const note = computed(() => noteStore.currentNote);
const loading = computed(() => noteStore.loading);
const error = computed(() => noteStore.error);
const socketConnected = computed(() => socketStore.connected);
const activeUsers = computed(() => socketStore.activeUsers);
const collaborators = computed(() => {
  const collabs = note.value?.collaborators || [];
  return collabs;
});
console.log("error:", error.value);

const noteId = computed(() => route.params.id as string);

// Socket event listeners setup
const setupSocketListeners = () => {
  // Listen for block creation from other users
  socketStore.onBlockCreated((data) => {
    if (
      data.block.noteId === noteId.value &&
      note.value &&
      data.createdBy !== authStore.user?.id
    ) {
      // Only add blocks created by other users (not current user)
      const newBlock = {
        ...data.block,
        type: data.block.type as "TEXT" | "CHECKLIST" | "IMAGE" | "CODE",
      };
      note.value.blocks.push(newBlock);

      // Sort blocks by orderIndex to maintain order
      note.value.blocks.sort((a, b) => a.orderIndex - b.orderIndex);
    }
  });

  // Listen for block deletion from other users
  socketStore.onBlockDeleted((data) => {
    if (note.value && data.deletedBy !== authStore.user?.id) {
      // Only remove blocks deleted by other users (not current user)
      note.value.blocks = note.value.blocks.filter(
        (block) => block.id !== data.blockId
      );
    }
  });

  // Listen for block updates from other users
  socketStore.onBlockUpdated((data) => {
    if (note.value && data.updatedBy !== authStore.user?.id) {
      // Only apply updates from other users (not current user)
      const blockIndex = note.value.blocks.findIndex(
        (block) => block.id === data.blockId
      );
      if (blockIndex !== -1) {
        // Update the block content
        note.value.blocks[blockIndex].content = data.content;
        note.value.blocks[blockIndex].type = data.type as
          | "TEXT"
          | "CHECKLIST"
          | "IMAGE"
          | "CODE";
      }
    }
  });

  // Listen for block reordering from other users
  socketStore.onBlocksReordered((data) => {
    if (note.value && data.updatedBy !== authStore.user?.id) {
      // Only apply reordering from other users (not current user)
      // Update order indices for all affected blocks
      data.blocks.forEach((blockUpdate) => {
        const blockIndex = note.value!.blocks.findIndex(
          (block) => block.id === blockUpdate.id
        );
        if (blockIndex !== -1) {
          note.value!.blocks[blockIndex].orderIndex = blockUpdate.orderIndex;
        }
      });

      // Sort blocks by orderIndex to reflect new order
      note.value.blocks.sort((a, b) => a.orderIndex - b.orderIndex);
    }
  });
};

onMounted(async () => {
  // Clear any previous errors
  noteStore.clearError();

  // Connect socket
  socketStore.connect();

  // Set up socket event listeners for real-time collaboration
  setupSocketListeners();

  try {
    await noteStore.fetchNote(noteId.value);

    if (note.value) {
      noteTitle.value = note.value.title;
    }
  } catch (err) {
    console.error("Failed to fetch note:", err);
  }
});

onUnmounted(() => {
  if (titleUpdateTimeout.value) {
    clearTimeout(titleUpdateTimeout.value);
  }

  // Clean up socket listeners
  socketStore.offBlockCreated();
  socketStore.offBlockDeleted();
  socketStore.offBlockUpdated();
  socketStore.offBlocksReordered();
});

watch(note, (newNote) => {
  if (newNote && newNote.title !== noteTitle.value) {
    noteTitle.value = newNote.title;
  }
});

const debouncedUpdateTitle = () => {
  if (titleUpdateTimeout.value) {
    clearTimeout(titleUpdateTimeout.value);
  }

  titleUpdateTimeout.value = setTimeout(() => {
    updateTitle();
  }, 1000); // 1 second debounce
};

const updateTitle = async () => {
  if (note.value && noteTitle.value !== note.value.title) {
    try {
      await noteStore.updateNote(note.value.id, { title: noteTitle.value });
    } catch (err) {
      console.error("Failed to update note title:", err);
    }
  }
};

const goBack = () => {
  router.push("/");
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "just now";
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days !== 1 ? "s" : ""} ago`;
  }
};

// Collaboration methods
const openShareModal = () => {
  console.log("Opening share modal");
  console.log("Current note:", note.value);
  console.log("Current collaborators:", collaborators.value);
  console.log("Current isPublic:", note.value?.isPublic);
  showShareModal.value = true;
};

const handleAddCollaborator = async (data: {
  email: string;
  permission: string;
}) => {
  try {
    console.log("handleAddCollaborator called with:", data);
    console.log("Current note:", note.value);

    if (!note.value) {
      console.error("No note available");
      return;
    }

    const permission = data.permission as "view" | "comment" | "edit";
    console.log("Adding collaborator to note:", note.value.id);

    await noteStore.addCollaborator(note.value.id, data.email, permission);

    console.log("Collaborator added successfully");
    console.log("Updated collaborators:", note.value.collaborators);

    showToast({
      type: "success",
      message: `${data.email} has been invited to collaborate`,
    });
  } catch (error) {
    console.error("Failed to add collaborator:", error);
    showToast({
      type: "error",
      message: "Failed to add collaborator",
    });
  }
};

const handleRemoveCollaborator = async (collaboratorId: string) => {
  try {
    if (!note.value) return;

    await noteStore.removeCollaborator(note.value.id, collaboratorId);

    showToast({
      type: "success",
      message: "Collaborator removed",
    });
  } catch (error) {
    console.error("Failed to remove collaborator:", error);
    showToast({
      type: "error",
      message: "Failed to remove collaborator",
    });
  }
};

const handleTogglePublic = async (isPublic: boolean) => {
  try {
    console.log("handleTogglePublic called with:", isPublic);
    console.log("Current note:", note.value);

    if (!note.value) {
      console.error("No note available for toggle public");
      return;
    }

    console.log("Updating public status for note:", note.value.id);
    await noteStore.updateNotePublicStatus(note.value.id, isPublic);
    console.log("Public status updated. New status:", note.value.isPublic);

    showToast({
      type: "success",
      message: isPublic ? "Note is now public" : "Note is now private",
    });
  } catch (error) {
    console.error("Failed to toggle public status:", error);
    showToast({
      type: "error",
      message: "Failed to update sharing settings",
    });
  }
};
</script>

<style scoped>
/* Add any custom styles here */
</style>
