import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth.ts";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("../views/HomeView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/login",
      name: "login",
      component: () => import("../views/LoginView.vue"),
    },
    {
      path: "/register",
      name: "register",
      component: () => import("../views/RegisterView.vue"),
    },
    {
      path: "/notes",
      name: "notes",
      component: () => import("../views/NotesView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/notes/:id",
      name: "note-editor",
      component: () => import("../views/NoteEditorView.vue"),
      meta: { requiresAuth: true },
    },
  ],
});

// Navigation guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next("/login");
  } else if (
    (to.name === "login" || to.name === "register") &&
    authStore.isAuthenticated
  ) {
    next("/");
  } else {
    next();
  }
});

// } else if (
//   (to.name === "login" || to.name === "register") &&
//   authStore.isAuthenticated
// ) {
//   next("/");
// } else {
//   next();
// }
// });

export default router;
