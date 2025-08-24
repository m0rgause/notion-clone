<template>
  <div class="block-editor">
    <!-- Empty State -->
    <div v-if="blocks.length === 0" class="empty-state py-16">
      <div class="text-center">
        <div class="text-6xl mb-4">📝</div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Start writing</h3>
        <p class="text-gray-500 mb-6">Click to add your first block</p>
        <button
          @click="addBlock('TEXT')"
          class="inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
        >
          <svg
            class="w-4 h-4 mr-2"
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
          Add a block
        </button>
      </div>
    </div>

    <!-- Blocks Container -->
    <draggable
      v-else
      v-model="blocks"
      @end="onDragEnd"
      handle=".drag-handle"
      item-key="id"
      class="blocks-container space-y-1"
    >
      <template #item="{ element: block }">
        <div
          :key="block.id"
          class="block-wrapper group relative min-h-[1.5rem] py-1"
          :class="{
            'bg-blue-50 rounded-md': focusedBlockId === block.id,
          }"
        >
          <!-- Block Controls -->
          <div
            class="absolute -left-18 top-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center space-x-1"
          >
            <!-- Drag Handle -->
            <button
              class="drag-handle w-8 h-8 text-gray-500 hover:text-gray-600 cursor-grab active:cursor-grabbing rounded hover:bg-gray-100 p-0.5 transition-colors"
              title="Drag to reorder"
            >
              <svg class="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M8 6h2v2H8V6zm0 4h2v2H8v-2zm0 4h2v2H8v-2zm4-8h2v2h-2V6zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2z"
                />
              </svg>
            </button>

            <!-- Block Menu -->
            <div class="relative">
              <button
                @click.stop="toggleBlockMenu(block.id)"
                class="w-8 h-8 text-gray-500 hover:text-gray-600 rounded hover:bg-gray-100 p-0.5 transition-colors"
                title="Block options"
              >
                <svg
                  class="w-7 h-7"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-2.828 0L9 13zm-6 6h12"
                  />
                </svg>
              </button>

              <!-- Block Type Menu -->
              <div
                v-if="openMenuId === block.id"
                @click.stop
                class="absolute left-8 top-0 bg-white border border-gray-200 rounded-lg shadow-xl z-50 w-56 py-2"
              >
                <div
                  class="px-2 py-1 text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-gray-100 mb-2"
                >
                  Turn into
                </div>
                <button
                  @click="changeBlockType(block.id, 'TEXT')"
                  class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3 rounded mx-1"
                >
                  <span class="text-base">📝</span>
                  <div>
                    <div class="font-medium">Text</div>
                    <div class="text-xs text-gray-500">
                      Plain text paragraph
                    </div>
                  </div>
                </button>
                <button
                  @click="changeBlockType(block.id, 'CHECKLIST')"
                  class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3 rounded mx-1"
                >
                  <span class="text-base">✅</span>
                  <div>
                    <div class="font-medium">To-do list</div>
                    <div class="text-xs text-gray-500">
                      Track tasks with checkboxes
                    </div>
                  </div>
                </button>
                <button
                  @click="changeBlockType(block.id, 'IMAGE')"
                  class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3 rounded mx-1"
                >
                  <span class="text-base">🖼️</span>
                  <div>
                    <div class="font-medium">Image</div>
                    <div class="text-xs text-gray-500">
                      Upload or embed with link
                    </div>
                  </div>
                </button>
                <button
                  @click="changeBlockType(block.id, 'CODE')"
                  class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3 rounded mx-1"
                >
                  <span class="text-base">💻</span>
                  <div>
                    <div class="font-medium">Code</div>
                    <div class="text-xs text-gray-500">
                      Capture a code snippet
                    </div>
                  </div>
                </button>
                <div class="border-t border-gray-100 mt-2 pt-2">
                  <button
                    @click="duplicateBlock(block.id)"
                    class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded mx-1"
                  >
                    Duplicate
                  </button>
                  <button
                    @click="deleteBlock(block.id)"
                    class="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded mx-1"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Block Content -->
          <div
            class="block-content min-h-[1.5rem] py-1 px-1 rounded-sm transition-colors"
            @focus="focusedBlockId = block.id"
            @blur="focusedBlockId = null"
          >
            <TextBlock
              v-if="block.type === 'TEXT'"
              :content="block.content || ''"
              :is-focused="focusedBlockId === block.id"
              @update="updateBlock(block.id, $event)"
            />
            <ChecklistBlock
              v-else-if="block.type === 'CHECKLIST'"
              :content="block.content || ''"
              @update="updateBlock(block.id, $event)"
            />
            <ImageBlock
              v-else-if="block.type === 'IMAGE'"
              :content="block.content || ''"
              @update="updateBlock(block.id, $event)"
            />
            <CodeBlock
              v-else-if="block.type === 'CODE'"
              :content="block.content || ''"
              @update="updateBlock(block.id, $event)"
            />
          </div>

          <!-- Add Block Below Button -->
          <div
            class="add-block-below opacity-0 group-hover:opacity-100 transition-opacity duration-200 mt-1"
          >
            <div class="flex justify-start ml-1 relative">
              <button
                @click.stop="toggleAddMenu(block.id)"
                class="inline-flex items-center text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded px-1 py-0.5 transition-colors"
              >
                <svg
                  class="w-5 h-5 mr-1"
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
                <span class="text-xs">Click to add below</span>
              </button>

              <!-- Add Block Menu -->
              <div
                v-if="openAddMenuId === block.id"
                @click.stop
                class="absolute top-8 left-0 bg-white border border-gray-200 rounded-lg shadow-xl z-50 w-56 py-2"
              >
                <div
                  class="px-2 py-1 text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-gray-100 mb-2"
                >
                  Add a block
                </div>
                <button
                  @click="addBlockAfter(block.id, 'TEXT')"
                  class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3 rounded mx-1"
                >
                  <span class="text-base">📝</span>
                  <div>
                    <div class="font-medium">Text</div>
                    <div class="text-xs text-gray-500">
                      Plain text paragraph
                    </div>
                  </div>
                </button>
                <button
                  @click="addBlockAfter(block.id, 'CHECKLIST')"
                  class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3 rounded mx-1"
                >
                  <span class="text-base">✅</span>
                  <div>
                    <div class="font-medium">To-do list</div>
                    <div class="text-xs text-gray-500">
                      Track tasks with checkboxes
                    </div>
                  </div>
                </button>
                <button
                  @click="addBlockAfter(block.id, 'IMAGE')"
                  class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3 rounded mx-1"
                >
                  <span class="text-base">🖼️</span>
                  <div>
                    <div class="font-medium">Image</div>
                    <div class="text-xs text-gray-500">
                      Upload or embed with link
                    </div>
                  </div>
                </button>
                <button
                  @click="addBlockAfter(block.id, 'CODE')"
                  class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3 rounded mx-1"
                >
                  <span class="text-base">💻</span>
                  <div>
                    <div class="font-medium">Code</div>
                    <div class="text-xs text-gray-500">
                      Capture a code snippet
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </template>
    </draggable>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";
import draggable from "vuedraggable";
import TextBlock from "./blocks/TextBlock.vue";
import ChecklistBlock from "./blocks/ChecklistBlock.vue";
import ImageBlock from "./blocks/ImageBlock.vue";
import CodeBlock from "./blocks/CodeBlock.vue";
import { useNoteStore } from "@/stores/note";
import { useSocketStore } from "@/stores/socket";

interface Block {
  id: string;
  type: "TEXT" | "CHECKLIST" | "IMAGE" | "CODE";
  content: string;
  orderIndex: number;
  parentId?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Props {
  noteId: string;
  initialBlocks: Block[];
}

const props = defineProps<Props>();

const noteStore = useNoteStore();
const socketStore = useSocketStore();

const blocks = ref<Block[]>([]);
const focusedBlockId = ref<string | null>(null);
const openMenuId = ref<string | null>(null);
const openAddMenuId = ref<string | null>(null);

// Autosave functionality
const autosaveTimeout = ref<number | null>(null);
const AUTOSAVE_DELAY = 1000; // 1 second

const initializeBlocks = () => {
  blocks.value = [...props.initialBlocks].sort(
    (a, b) => a.orderIndex - b.orderIndex
  );
};

// Watch for changes in initialBlocks prop
watch(
  () => props.initialBlocks,
  (newBlocks) => {
    console.log("BlockEditor: initialBlocks changed", newBlocks.length);
    blocks.value = [...newBlocks].sort((a, b) => a.orderIndex - b.orderIndex);
  },
  { deep: true }
);

onMounted(() => {
  initializeBlocks();

  // Note: Socket connection and events are now handled by NoteDetailView
  // No need to join note room or listen to events here

  // Close menus when clicking outside
  document.addEventListener("click", closeMenusOnOutsideClick);
});

onUnmounted(() => {
  // Note: Socket cleanup is handled by NoteDetailView
  document.removeEventListener("click", closeMenusOnOutsideClick);
  if (autosaveTimeout.value) {
    clearTimeout(autosaveTimeout.value);
  }
});

const closeMenus = () => {
  openMenuId.value = null;
  openAddMenuId.value = null;
};

const closeMenusOnOutsideClick = (event: Event) => {
  const target = event.target as HTMLElement;
  // Check if click is outside menu containers
  if (!target.closest(".block-wrapper")) {
    closeMenus();
  }
};

const toggleBlockMenu = (blockId: string) => {
  openMenuId.value = openMenuId.value === blockId ? null : blockId;
  openAddMenuId.value = null;
};

const toggleAddMenu = (blockId: string) => {
  openAddMenuId.value = openAddMenuId.value === blockId ? null : blockId;
  openMenuId.value = null;
};

const scheduleAutosave = () => {
  if (autosaveTimeout.value) {
    clearTimeout(autosaveTimeout.value);
  }

  autosaveTimeout.value = setTimeout(async () => {
    await reorderBlocksNow();
  }, AUTOSAVE_DELAY);
};

const reorderBlocksNow = async () => {
  try {
    // Only reorder blocks that have been saved to the database
    // const savedBlocks = blocks.value.filter(
    //   (block) => block.id && block.id.length > 10 // Ensure it's a valid database ID
    // );
    // if (savedBlocks.length === 0) {
    //   console.log("No saved blocks to reorder");
    //   return;
    // }
    // await noteStore.reorderBlocks(
    //   props.noteId,
    //   savedBlocks.map((block) => ({
    //     id: block.id,
    //     orderIndex: block.orderIndex,
    //   }))
    // );
  } catch (error) {
    console.error("Reorder failed:", error);
  }
};

const updateBlock = async (blockId: string, content: string) => {
  const block = blocks.value.find((b) => b.id === blockId);
  if (block) {
    block.content = content;

    try {
      await noteStore.updateBlock(props.noteId, blockId, content);

      // Emit real-time update
      socketStore.emitBlockUpdate({
        noteId: props.noteId,
        blockId,
        content,
        type: block.type,
      });
    } catch (error) {
      console.error("Failed to update block:", error);
    }
  }
};

const addBlock = async (type: Block["type"]) => {
  try {
    const orderIndex = blocks.value.length;
    await noteStore.createBlock(props.noteId, {
      type,
      content: "",
      orderIndex,
      parentId: null,
    });
    // Don't manually add to blocks.value - it will be updated via socket events
    closeMenus();
  } catch (error) {
    console.error("Failed to add block:", error);
  }
};

const addBlockAfter = async (afterBlockId: string, type: Block["type"]) => {
  try {
    const afterIndex = blocks.value.findIndex((b) => b.id === afterBlockId);
    if (afterIndex === -1) return;

    const newOrderIndex = blocks.value[afterIndex].orderIndex + 1;

    // Update order indices of blocks that come after
    blocks.value.forEach((block) => {
      if (block.orderIndex >= newOrderIndex) {
        block.orderIndex++;
      }
    });

    await noteStore.createBlock(props.noteId, {
      type,
      content: "",
      orderIndex: newOrderIndex,
      parentId: null,
    });

    // Don't manually add to blocks.value - it will be updated via socket events
    closeMenus();

    // Wait longer to ensure the block is fully created in the database
    setTimeout(() => {
      scheduleAutosave();
    }, 1000);
  } catch (error) {
    console.error("Failed to add block:", error);
  }
};

const changeBlockType = async (blockId: string, newType: Block["type"]) => {
  const block = blocks.value.find((b) => b.id === blockId);
  if (block && block.type !== newType) {
    block.type = newType;
    block.content = ""; // Reset content when changing type

    try {
      await noteStore.updateBlock(props.noteId, blockId, "");

      // Emit real-time update
      socketStore.emitBlockUpdate({
        noteId: props.noteId,
        blockId,
        content: "",
        type: newType,
      });
    } catch (error) {
      console.error("Failed to change block type:", error);
    }
  }
  closeMenus();
};

const duplicateBlock = async (blockId: string) => {
  const block = blocks.value.find((b) => b.id === blockId);
  if (block) {
    try {
      const blockIndex = blocks.value.findIndex((b) => b.id === blockId);
      const newOrderIndex = block.orderIndex + 1;

      // Update order indices of blocks that come after
      blocks.value.forEach((b) => {
        if (b.orderIndex >= newOrderIndex) {
          b.orderIndex++;
        }
      });

      const newBlock = await noteStore.createBlock(props.noteId, {
        type: block.type,
        content: block.content,
        orderIndex: newOrderIndex,
        parentId: block.parentId,
      });

      blocks.value.splice(blockIndex + 1, 0, newBlock);

      // Wait longer to ensure the block is fully created in the database
      setTimeout(() => {
        scheduleAutosave();
      }, 1000);
    } catch (error) {
      console.error("Failed to duplicate block:", error);
    }
  }
  closeMenus();
};

const deleteBlock = async (blockId: string) => {
  try {
    await noteStore.deleteBlock(props.noteId, blockId);

    // Don't manually update local state - let socket events handle the deletion
    // This prevents conflicts between manual updates and socket events

    closeMenus();
  } catch (error) {
    console.error("Failed to delete block:", error);
    closeMenus();
  }
};

const onDragEnd = () => {
  // Update order indices based on new position
  blocks.value.forEach((block, index) => {
    block.orderIndex = index;
  });

  // Emit real-time reorder update
  socketStore.emitBlocksReorder({
    noteId: props.noteId,
    blocks: blocks.value.map((block) => ({
      id: block.id,
      orderIndex: block.orderIndex,
    })),
  });

  setTimeout(() => {
    scheduleAutosave();
  }, 500);
};
</script>

<style scoped>
.block-editor {
  max-width: 100%;
  margin: 0 auto;
  padding-left: 4rem; /* Space for drag handles */
  font-family:
    ui-sans-serif,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Helvetica,
    "Apple Color Emoji",
    Arial,
    sans-serif,
    "Segoe UI Emoji",
    "Segoe UI Symbol";
}

.block-wrapper {
  position: relative;
  transition: all 0.15s ease;
  border-radius: 3px;
}

.block-wrapper:hover {
  background-color: rgba(55, 53, 47, 0.03);
}

.block-content {
  color: rgb(55, 53, 47);
  line-height: 1.5;
}

.drag-handle:hover {
  background-color: rgba(55, 53, 47, 0.08);
}

.blocks-container .sortable-ghost {
  opacity: 0.4;
  background: rgba(46, 170, 220, 0.15);
  border-radius: 3px;
}

.blocks-container .sortable-drag {
  transform: rotate(1deg);
  box-shadow: 0 8px 25px -8px rgba(0, 0, 0, 0.2);
}

.empty-state {
  color: rgba(55, 53, 47, 0.65);
}

/* Notion-like focus states */
.block-wrapper:focus-within {
  background-color: rgba(46, 170, 220, 0.1);
}

/* Clean menu styling */
.absolute {
  box-shadow:
    rgba(15, 15, 15, 0.05) 0px 0px 0px 1px,
    rgba(15, 15, 15, 0.1) 0px 3px 6px,
    rgba(15, 15, 15, 0.2) 0px 9px 24px;
}
</style>
