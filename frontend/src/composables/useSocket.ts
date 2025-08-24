import { ref, onMounted, onUnmounted } from "vue";
import { io, Socket } from "socket.io-client";

interface User {
  id: string;
  email: string;
}

export function useSocket() {
  const socket = ref<Socket | null>(null);
  const isConnected = ref(false);
  const activeUsers = ref<User[]>([]);

  onMounted(() => {
    socket.value = io("http://localhost:3000", {
      withCredentials: true, // This will send cookies with the connection
    });

    socket.value.on("connect", () => {
      isConnected.value = true;
    });

    socket.value.on("disconnect", () => {
      isConnected.value = false;
    });

    socket.value.on("user-joined", (user: User) => {
      if (!activeUsers.value.find((u) => u.id === user.id)) {
        activeUsers.value.push(user);
      }
    });

    socket.value.on("user-left", (userId: string) => {
      activeUsers.value = activeUsers.value.filter((u) => u.id !== userId);
    });

    socket.value.on("active-users", (users: User[]) => {
      activeUsers.value = users;
    });
  });

  onUnmounted(() => {
    if (socket.value) {
      socket.value.disconnect();
    }
  });

  const joinNote = (noteId: string) => {
    socket.value?.emit("join-note", noteId);
  };

  const leaveNote = (noteId: string) => {
    socket.value?.emit("leave-note", noteId);
  };

  const updateBlock = (data: {
    noteId: string;
    blockId: string;
    type: string;
    content: string;
  }) => {
    socket.value?.emit("block-update", data);
  };

  const reorderBlocks = (data: {
    noteId: string;
    blocks: { id: string; orderIndex: number }[];
  }) => {
    socket.value?.emit("block-reorder", data);
  };

  return {
    socket,
    isConnected,
    activeUsers,
    joinNote,
    leaveNote,
    updateBlock,
    reorderBlocks,
  };
}
