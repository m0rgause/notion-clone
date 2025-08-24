import { ref, createApp } from "vue";
import Toast from "@/components/ui/toast/Toast.vue";

interface ToastOptions {
  message: string;
  type?: "success" | "error" | "info" | "warning";
  duration?: number;
}

const toasts = ref<any[]>([]);

export const useToast = () => {
  const showToast = (options: ToastOptions) => {
    const toastId = Date.now();

    // Create a container for the toast
    const container = document.createElement("div");
    document.body.appendChild(container);

    // Create the toast app
    const app = createApp(Toast, {
      ...options,
      onClose: () => {
        app.unmount();
        document.body.removeChild(container);
        toasts.value = toasts.value.filter((t) => t.id !== toastId);
      },
    });

    // Mount the toast
    app.mount(container);

    // Keep track of the toast
    toasts.value.push({ id: toastId, app });
  };

  const success = (message: string, duration = 3000) => {
    showToast({ message, type: "success", duration });
  };

  const error = (message: string, duration = 5000) => {
    showToast({ message, type: "error", duration });
  };

  const info = (message: string, duration = 3000) => {
    showToast({ message, type: "info", duration });
  };

  const warning = (message: string, duration = 4000) => {
    showToast({ message, type: "warning", duration });
  };

  return {
    showToast,
    success,
    error,
    info,
    warning,
  };
};
