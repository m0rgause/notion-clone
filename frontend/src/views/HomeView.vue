<template>
  <div class="min-h-screen bg-white">
    <!-- Top Navigation -->
    <div
      class="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100"
    >
      <div class="max-w-6xl mx-auto px-6 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <h1 class="text-xl font-semibold text-gray-900">Workspace</h1>
            <div class="text-sm text-gray-500">{{ user?.email }}</div>
          </div>
          <div class="flex items-center space-x-3">
            <Button
              @click="createNewNote"
              class="inline-flex items-center px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-all duration-200 shadow-sm"
            >
              <PlusIcon class="h-4 w-4 mr-2" />
              New page
            </Button>
            <Button
              @click="logout"
              variant="ghost"
              class="text-gray-500 hover:text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors"
            >
              Sign out
            </Button>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-6xl mx-auto px-6 py-8">
      <!-- Welcome Section -->
      <div class="mb-12">
        <h2 class="text-3xl font-bold text-gray-900 mb-2">
          How can I help you today?
        </h2>
        <p class="text-gray-600">
          Welcome to your workspace. Everything starts with a page.
        </p>
      </div>

      <!-- Quick Stats - Minimal -->
      <div class="grid grid-cols-3 gap-8 mb-12">
        <div class="text-center">
          <div class="text-2xl font-bold text-gray-900 mb-1">
            {{ noteStore.notes.length }}
          </div>
          <div class="text-sm text-gray-500">Pages</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-gray-900 mb-1">
            {{ totalBlocks }}
          </div>
          <div class="text-sm text-gray-500">Blocks</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-gray-900 mb-1">
            {{ lastUpdatedNote ? "Today" : "None" }}
          </div>
          <div class="text-sm text-gray-500">Last edited</div>
        </div>
      </div>

      <!-- Notes List -->
      <div>
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-gray-900">Recent pages</h3>
        </div>

        <div
          v-if="noteStore.loading"
          class="flex items-center justify-center py-24"
        >
          <div
            class="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-gray-900"
          ></div>
        </div>

        <div v-else-if="noteStore.notes.length === 0" class="text-center py-24">
          <div class="mb-6">
            <div
              class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4"
            >
              <DocumentTextIcon class="h-6 w-6 text-gray-400" />
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">
              Create your first page
            </h3>
            <p class="text-gray-500 max-w-sm mx-auto">
              Start writing and organizing your thoughts. Your first page is
              just a click away.
            </p>
          </div>
          <Button
            @click="createNewNote"
            class="inline-flex items-center px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-all duration-200 shadow-sm"
          >
            <PlusIcon class="h-4 w-4 mr-2" />
            Create a page
          </Button>
        </div>

        <div v-else class="space-y-1">
          <div
            v-for="note in sortedNotes"
            :key="note.id"
            @click="openNote(note.id)"
            class="group flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer transition-colors rounded-lg"
          >
            <div class="flex items-center space-x-3 flex-1 min-w-0">
              <div class="flex-shrink-0">
                <div
                  class="w-6 h-6 bg-gray-100 rounded flex items-center justify-center"
                >
                  <DocumentTextIcon class="h-4 w-4 text-gray-400" />
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center space-x-2">
                  <h4 class="text-sm font-medium text-gray-900 truncate">
                    {{ note.title || "Untitled" }}
                  </h4>
                  <span
                    v-if="getPreviewText(note)"
                    class="text-xs text-gray-400"
                  >
                    {{ note.blocks.length }} block{{
                      note.blocks.length !== 1 ? "s" : ""
                    }}
                  </span>
                </div>
                <div
                  v-if="getPreviewText(note)"
                  class="mt-1 text-xs text-gray-500 truncate"
                >
                  {{ getPreviewText(note) }}
                </div>
              </div>
            </div>
            <div
              class="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <div class="text-xs text-gray-400">
                {{ formatDate(note.updatedAt) }}
              </div>
              <Button
                @click.stop="deleteNote(note.id)"
                variant="ghost"
                size="sm"
                class="text-gray-400 hover:text-red-600 hover:bg-red-50 p-1 rounded"
              >
                <svg
                  class="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="mt-16 pt-8 border-t border-gray-100">
        <h3 class="text-sm font-medium text-gray-500 mb-4">Quick actions</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            @click="createNewNote"
            class="text-left p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 group"
          >
            <div
              class="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-gray-200 transition-colors"
            >
              <PlusIcon class="h-4 w-4 text-gray-600" />
            </div>
            <div class="text-sm font-medium text-gray-900 mb-1">New page</div>
            <div class="text-xs text-gray-500">Start writing</div>
          </button>

          <button
            class="text-left p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 group opacity-50 cursor-not-allowed"
            disabled
          >
            <div
              class="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mb-3"
            >
              <svg
                class="h-4 w-4 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div class="text-sm font-medium text-gray-900 mb-1">Template</div>
            <div class="text-xs text-gray-500">Coming soon</div>
          </button>

          <button
            class="text-left p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 group opacity-50 cursor-not-allowed"
            disabled
          >
            <div
              class="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mb-3"
            >
              <svg
                class="h-4 w-4 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div class="text-sm font-medium text-gray-900 mb-1">Import</div>
            <div class="text-xs text-gray-500">Coming soon</div>
          </button>

          <button
            class="text-left p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 group opacity-50 cursor-not-allowed"
            disabled
          >
            <div
              class="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mb-3"
            >
              <svg
                class="h-4 w-4 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div class="text-sm font-medium text-gray-900 mb-1">Settings</div>
            <div class="text-xs text-gray-500">Coming soon</div>
          </button>
        </div>
      </div>
    </div>

    <CreateNoteModal v-model="showCreateModal" @created="onNoteCreated" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useNoteStore } from "../stores/note";
import { useAuthStore } from "../stores/auth";
import CreateNoteModal from "@/components/notes/CreateNoteModal.vue";
import { Button } from "@/components/ui/button";
import { PlusIcon, DocumentTextIcon } from "@heroicons/vue/24/outline";

const router = useRouter();
const noteStore = useNoteStore();
const authStore = useAuthStore();

const user = computed(() => authStore.user);

const lastUpdatedNote = computed(() => {
  if (!noteStore.notes.length) return null;
  return [...noteStore.notes].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )[0];
});

const totalBlocks = computed(() => {
  return noteStore.notes.reduce((total, note) => total + note.blocks.length, 0);
});

const sortedNotes = computed(() => {
  return [...noteStore.notes].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
});

const showCreateModal = ref(false);

const createNewNote = () => {
  showCreateModal.value = true;
};

const openNote = (noteId: string) => {
  router.push(`/notes/${noteId}`);
};

const deleteNote = async (noteId: string) => {
  if (confirm("Are you sure you want to delete this page?")) {
    try {
      await noteStore.deleteNote(noteId);
    } catch (error) {
      console.error("Failed to delete note:", error);
    }
  }
};

const logout = async () => {
  try {
    await authStore.logout();
    router.push("/login");
  } catch (error) {
    console.error("Failed to logout:", error);
  }
};

const onNoteCreated = (note: any) => {
  showCreateModal.value = false;
  router.push(`/notes/${note.id}`);
};

const getPreviewText = (note: any) => {
  // Get preview text from the first text block
  const textBlock = note.blocks.find(
    (block: any) => block.type === "TEXT" && block.content
  );
  if (textBlock) {
    // Strip HTML tags for preview
    const text = textBlock.content.replace(/<[^>]*>/g, "");
    return text.length > 100 ? text.substring(0, 100) + "..." : text;
  }
  return "";
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "now";
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d`;
  } else {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
};

onMounted(async () => {
  try {
    await noteStore.fetchNotes();
  } catch (error) {
    console.error("Failed to fetch notes:", error);
  }
});
</script>
