<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b">
      <div class="max-w-6xl mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <h1 class="text-xl font-semibold text-gray-900">
              {{ note?.title || "Loading..." }}
            </h1>
            <div class="flex items-center space-x-2 text-sm text-gray-500">
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Public Note</span>
            </div>
          </div>
          <router-link
            to="/login"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In to Create Notes
          </router-link>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="max-w-4xl mx-auto px-4 py-8">
      <div class="animate-pulse">
        <div class="h-8 bg-gray-200 rounded w-1/2 mb-6"></div>
        <div class="space-y-4">
          <div class="h-4 bg-gray-200 rounded"></div>
          <div class="h-4 bg-gray-200 rounded w-3/4"></div>
          <div class="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="max-w-4xl mx-auto px-4 py-8">
      <div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <svg
          class="w-12 h-12 text-red-400 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.694-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
        <h3 class="text-lg font-medium text-red-800 mb-2">Note Not Found</h3>
        <p class="text-red-600">{{ error }}</p>
        <router-link
          to="/login"
          class="mt-4 inline-block px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Go to Login
        </router-link>
      </div>
    </div>

    <!-- Note Content -->
    <div v-else-if="note" class="max-w-4xl mx-auto px-4 py-8">
      <div class="bg-white rounded-lg shadow-sm border">
        <div class="p-6">
          <!-- Note Title -->
          <h1 class="text-3xl font-bold text-gray-900 mb-6">
            {{ note.title }}
          </h1>

          <!-- Note Blocks -->
          <div class="space-y-4">
            <div
              v-for="block in note.blocks"
              :key="block.id"
              class="block-content"
            >
              <!-- Text Block -->
              <div v-if="block.type === 'TEXT'" class="prose max-w-none">
                <div v-html="block.content || 'Empty block'"></div>
              </div>

              <!-- Checklist Block -->
              <div v-else-if="block.type === 'CHECKLIST'" class="space-y-2">
                <div
                  v-for="(item, index) in parseChecklistContent(block.content)"
                  :key="index"
                  class="flex items-center space-x-2"
                >
                  <input
                    type="checkbox"
                    :checked="item.checked"
                    disabled
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 opacity-60"
                  />
                  <span
                    :class="{ 'line-through text-gray-500': item.checked }"
                    >{{ item.text }}</span
                  >
                </div>
              </div>

              <!-- Code Block -->
              <div
                v-else-if="block.type === 'CODE'"
                class="bg-gray-900 rounded-lg p-4 overflow-x-auto"
              >
                <pre><code class="text-green-400 text-sm">{{ block.content || '// Empty code block' }}</code></pre>
              </div>

              <!-- Image Block -->
              <div v-else-if="block.type === 'IMAGE'" class="text-center">
                <img
                  v-if="block.content"
                  :src="block.content"
                  :alt="'Block image'"
                  class="max-w-full h-auto rounded-lg mx-auto"
                />
                <div
                  v-else
                  class="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8"
                >
                  <p class="text-gray-500">No image content</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div
            v-if="!note.blocks || note.blocks.length === 0"
            class="text-center py-8"
          >
            <p class="text-gray-500">This note is empty.</p>
          </div>
        </div>

        <!-- Footer -->
        <div class="border-t px-6 py-4 bg-gray-50">
          <div class="flex items-center justify-between text-sm text-gray-500">
            <span>Shared publicly</span>
            <span>Last updated: {{ formatDate(note.updatedAt) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useNoteStore } from "../stores/note";

const route = useRoute();
const noteStore = useNoteStore();

const note = ref<any>(null);
const loading = ref(true);
const error = ref<string | null>(null);

const parseChecklistContent = (content: string) => {
  if (!content) return [];
  try {
    return JSON.parse(content);
  } catch {
    return [{ text: content, checked: false }];
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

onMounted(async () => {
  try {
    const publicId = route.params.publicId as string;
    note.value = await noteStore.getPublicNote(publicId);
  } catch (err: any) {
    error.value =
      err.response?.data?.message || "Note not found or not accessible";
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.prose {
  line-height: 1.6;
}

.prose h1,
.prose h2,
.prose h3,
.prose h4,
.prose h5,
.prose h6 {
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  font-weight: 600;
}

.prose p {
  margin-bottom: 1em;
}

.prose ul,
.prose ol {
  margin-bottom: 1em;
  padding-left: 1.5em;
}

.prose li {
  margin-bottom: 0.25em;
}

.prose strong {
  font-weight: 600;
}

.prose em {
  font-style: italic;
}

.prose code {
  background-color: #f1f5f9;
  padding: 0.125em 0.25em;
  border-radius: 0.25em;
  font-size: 0.875em;
}

.prose blockquote {
  border-left: 4px solid #e2e8f0;
  padding-left: 1em;
  margin: 1em 0;
  color: #64748b;
}
</style>
