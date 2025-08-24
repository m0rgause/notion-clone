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
              Share "{{ noteTitle }}"
            </DialogTitle>
            <DialogDescription class="text-sm text-gray-500 mt-1">
              Invite others to collaborate on this note
            </DialogDescription>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="px-6 py-5">
        <!-- Current Access -->
        <div class="mb-6">
          <h3 class="text-sm font-medium text-gray-900 mb-3">Who has access</h3>
          <div class="space-y-2">
            <!-- Owner -->
            <div class="flex items-center justify-between py-2">
              <div class="flex items-center space-x-3">
                <div
                  class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium"
                >
                  {{ ownerInitials }}
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-900">
                    {{ ownerEmail }} (You)
                  </p>
                  <p class="text-xs text-gray-500">Owner</p>
                </div>
              </div>
            </div>

            <!-- Collaborators -->
            <div
              v-for="collaborator in props.collaborators"
              :key="collaborator.id"
              class="flex items-center justify-between py-2"
            >
              <div class="flex items-center space-x-3">
                <div
                  class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-medium"
                >
                  {{ getInitials(collaborator.email) }}
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-900">
                    {{ collaborator.email }}
                  </p>
                  <p class="text-xs text-gray-500">
                    {{ collaborator.permission }}
                  </p>
                </div>
              </div>
              <button
                @click="removeCollaborator(collaborator.id)"
                class="text-gray-400 hover:text-red-500 transition-colors"
                title="Remove access"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Add Collaborator -->
        <div class="mb-6">
          <h3 class="text-sm font-medium text-gray-900 mb-3">Add people</h3>
          <div class="flex space-x-2">
            <Input
              v-model="newCollaboratorEmail"
              type="email"
              placeholder="Enter email address"
              class="flex-1"
              @keyup.enter="addCollaborator"
            />
            <select
              v-model="newCollaboratorPermission"
              class="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="view">Can view</option>
              <option value="comment">Can comment</option>
              <option value="edit">Can edit</option>
            </select>
            <Button
              @click="addCollaborator"
              :disabled="!newCollaboratorEmail || adding"
              size="sm"
            >
              {{ adding ? "Adding..." : "Add" }}
            </Button>
          </div>
        </div>

        <!-- Public Link -->
        <div class="border-t border-gray-100 pt-6">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-medium text-gray-900">Public link</h3>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                v-model="localIsPublic"
                @change="togglePublicAccess"
                class="sr-only"
              />
              <div
                :class="[
                  'w-11 h-6 rounded-full transition-colors',
                  localIsPublic ? 'bg-blue-600' : 'bg-gray-200',
                ]"
              >
                <div
                  :class="[
                    'w-5 h-5 bg-white rounded-full shadow transition-transform',
                    localIsPublic ? 'translate-x-5' : 'translate-x-0.5',
                  ]"
                ></div>
              </div>
            </label>
          </div>

          <div v-if="localIsPublic" class="space-y-3">
            <div class="flex items-center space-x-2">
              <Input :value="publicLink" readonly class="flex-1 text-sm" />
              <Button @click="copyPublicLink" size="sm" variant="outline">
                {{ copied ? "Copied!" : "Copy" }}
              </Button>
            </div>
            <p class="text-xs text-gray-500">
              Anyone with this link can view this note
            </p>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 bg-gray-50 border-t border-gray-100">
        <div class="flex justify-end">
          <Button @click="$emit('update:modelValue', false)" variant="outline">
            Done
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useToast } from "@/composables/useToast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

interface Collaborator {
  id: string;
  email: string;
  permission: "view" | "comment" | "edit";
}

interface Props {
  modelValue: boolean;
  noteId: string;
  noteTitle: string;
  ownerEmail: string;
  collaborators: Collaborator[];
  isPublic: boolean;
  publicId?: string;
}

interface Emits {
  (e: "update:modelValue", value: boolean): void;
  (e: "add-collaborator", data: { email: string; permission: string }): void;
  (e: "remove-collaborator", collaboratorId: string): void;
  (e: "toggle-public", isPublic: boolean): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const { success, error } = useToast();

const newCollaboratorEmail = ref("");
const newCollaboratorPermission = ref<"view" | "comment" | "edit">("edit");
const adding = ref(false);
const copied = ref(false);

// Local state for public status to avoid v-model on prop
const localIsPublic = ref(props.isPublic);

// Update local state when prop changes
watch(
  () => props.isPublic,
  (newValue) => {
    console.log("ShareNoteModal: isPublic prop changed:", newValue);
    localIsPublic.value = newValue;
  }
);

// Watch collaborators prop
watch(
  () => props.collaborators,
  (newValue) => {
    console.log("ShareNoteModal: collaborators prop changed:", newValue);
  },
  { deep: true }
);

// Watch modal open/close
watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      console.log("ShareNoteModal opened with props:", {
        collaborators: props.collaborators,
        isPublic: props.isPublic,
        noteId: props.noteId,
      });
      // Sync local state with props when modal opens
      localIsPublic.value = props.isPublic;
    }
  }
);

const ownerInitials = computed(() => {
  return getInitials(props.ownerEmail);
});

const publicLink = computed(() => {
  if (props.publicId) {
    return `${window.location.origin}/public/${props.publicId}`;
  }
  return "";
});

const getInitials = (email: string) => {
  return email
    .split("@")[0]
    .split(".")
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2);
};

const addCollaborator = async () => {
  console.log("ShareNoteModal addCollaborator called");
  console.log("Email:", newCollaboratorEmail.value);
  console.log("Permission:", newCollaboratorPermission.value);

  if (!newCollaboratorEmail.value) {
    console.log("No email provided");
    return;
  }

  adding.value = true;
  try {
    console.log("Emitting add-collaborator event");
    emit("add-collaborator", {
      email: newCollaboratorEmail.value,
      permission: newCollaboratorPermission.value,
    });

    success(`Invited ${newCollaboratorEmail.value} to collaborate`);
    newCollaboratorEmail.value = "";
    newCollaboratorPermission.value = "edit";
    console.log("Add collaborator completed successfully");
  } catch (err) {
    console.error("Error in addCollaborator:", err);
    error("Failed to add collaborator");
  } finally {
    adding.value = false;
  }
};

const removeCollaborator = (collaboratorId: string) => {
  emit("remove-collaborator", collaboratorId);
  success("Collaborator removed");
};

const togglePublicAccess = () => {
  // The checkbox v-model already toggles localIsPublic, so we emit the new value
  emit("toggle-public", localIsPublic.value);
};

const copyPublicLink = async () => {
  try {
    await navigator.clipboard.writeText(publicLink.value);
    copied.value = true;
    success("Link copied to clipboard");
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (err) {
    error("Failed to copy link");
  }
};
</script>
