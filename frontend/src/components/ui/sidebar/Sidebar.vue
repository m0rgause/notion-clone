<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useNoteStore } from "@/stores/note";
import { Button } from "@/components/ui/button";
import CreateNoteModal from "@/components/notes/CreateNoteModal.vue";
import { Input } from "@/components/ui/input";
import {
  IconChevronLeft,
  IconNotes,
  IconPlus,
  IconTrash,
  IconDots,
  IconSearch,
} from "@tabler/icons-vue";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

const router = useRouter();
const noteStore = useNoteStore();
const isCollapsed = ref(false);
const searchQuery = ref("");

const filteredAndSortedNotes = computed(() => {
  let notes = [...noteStore.notes];

  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    notes = notes.filter(
      (note) =>
        note.title.toLowerCase().includes(query) ||
        note.blocks.some((block) => block.content.toLowerCase().includes(query))
    );
  }

  // Sort by last updated
  return notes.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
});

// Keyboard shortcuts
const handleKeyPress = (e: KeyboardEvent) => {
  // Cmd/Ctrl + / to toggle sidebar
  if (e.key === "/" && (e.metaKey || e.ctrlKey)) {
    e.preventDefault();
    toggleSidebar();
  }
  // Cmd/Ctrl + N for new note
  if (e.key.toLowerCase() === "n" && (e.metaKey || e.ctrlKey)) {
    e.preventDefault();
    createNewNote();
  }
};

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value;
};

const showCreateModal = ref(false);

const createNewNote = () => {
  showCreateModal.value = true;
};

const deleteNote = async (noteId: string, event: Event) => {
  event.stopPropagation();
  try {
    await noteStore.deleteNote(noteId);
    if (router.currentRoute.value.params.id === noteId) {
      router.push("/");
    }
  } catch (error) {
    console.error("Failed to delete note:", error);
  }
};

onMounted(async () => {
  try {
    await noteStore.fetchNotes();
    window.addEventListener("keydown", handleKeyPress);
  } catch (error) {
    console.error("Failed to fetch notes:", error);
  }
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyPress);
});
</script>

<template>
  <aside
    class="group/sidebar relative flex h-screen flex-col border-r border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300"
    :class="[isCollapsed ? 'w-[67px]' : 'w-[280px]']"
  >
    <div class="flex h-[60px] items-center justify-between p-4 pb-4">
      <h2
        class="flex items-center gap-2 font-semibold"
        :class="[isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100']"
      >
        <IconNotes class="h-5 w-5" />
        <span class="transition-opacity duration-300">Notes</span>
      </h2>

      <Button
        variant="ghost"
        size="icon"
        class="h-8 w-8"
        @click="toggleSidebar"
        :style="{ visibility: isCollapsed ? 'visible' : 'visible' }"
      >
        <IconChevronLeft
          class="h-4 w-4 transition-transform duration-200"
          :class="[isCollapsed ? 'rotate-180' : 'rotate-0']"
        />
      </Button>
    </div>

    <div class="flex-1 overflow-y-auto">
      <div class="flex flex-col gap-2 p-4">
        <Button
          variant="outline"
          class="justify-start gap-2 hover:bg-primary/5"
          :class="[isCollapsed ? 'px-2' : 'px-4']"
          @click="createNewNote"
          :disabled="noteStore.loading"
        >
          <IconPlus
            class="h-4 w-4"
            :class="{ 'animate-spin': noteStore.loading }"
          />
          <span
            class="transition-opacity duration-300"
            :class="[isCollapsed ? 'opacity-0 w-0' : 'opacity-100']"
          >
            {{ noteStore.loading ? "Creating..." : "New Note" }}
          </span>
        </Button>

        <div class="flex items-center gap-2" v-if="!isCollapsed">
          <div class="relative flex-1">
            <Input
              v-model="searchQuery"
              placeholder="Search notes..."
              class="pr-8"
            />
            <IconSearch
              class="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
            />
          </div>
        </div>
      </div>

      <nav class="flex flex-col gap-1 px-2">
        <div v-if="!isCollapsed" class="px-2 py-1.5">
          <span class="text-xs font-medium text-muted-foreground">
            Recent Notes
          </span>
        </div>

        <!-- Note list -->
        <div class="relative flex flex-col gap-1">
          <div
            v-for="note in filteredAndSortedNotes"
            :key="note.id"
            class="group relative"
          >
            <Button
              variant="ghost"
              class="w-full justify-start gap-2 hover:bg-primary/5"
              :class="[
                isCollapsed ? 'px-2' : 'px-4',
                $route.params.id === note.id ? 'bg-primary/10' : '',
              ]"
              @click="router.push(`/notes/${note.id}`)"
            >
              <IconNotes class="h-4 w-4 shrink-0" />
              <span
                class="flex-1 truncate transition-opacity duration-300"
                :class="[isCollapsed ? 'opacity-0 w-0' : 'opacity-100']"
              >
                {{ note.title || "Untitled Note" }}
              </span>
            </Button>

            <DropdownMenu v-if="!isCollapsed">
              <DropdownMenuTrigger
                as="div"
                class="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Button variant="ghost" size="icon" class="h-6 w-6">
                  <IconDots class="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" class="w-40">
                <DropdownMenuItem
                  @click="deleteNote(note.id, $event)"
                  class="text-destructive"
                >
                  <IconTrash class="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>
    </div>
  </aside>

  <CreateNoteModal v-model="showCreateModal" />
</template>
