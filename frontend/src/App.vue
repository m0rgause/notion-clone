<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from './stores/auth';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Sidebar } from '@/components/ui/sidebar';

const router = useRouter();
const authStore = useAuthStore();

onMounted(async () => {
  try {
    await authStore.checkAuth();
  } catch (error) {
    console.error('Auth check failed:', error);
  }
});

const handleLogout = async () => {
  try {
    await authStore.logout();
    router.push('/login');
  } catch (error) {
    console.error('Logout failed:', error);
  }
};
</script>

<template>
  <div class="min-h-screen bg-background font-sans antialiased">
    <!-- Loading State -->
    <div 
      v-if="authStore.loading" 
      class="flex items-center justify-center min-h-screen"
    >
      <div class="relative">
        <!-- Animated background effect -->
        <div class="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 rounded-lg blur-xl animate-pulse" />
        
        <div class="relative space-y-4 bg-card/50 backdrop-blur-sm rounded-lg border border-border/50 p-8">
          <Skeleton class="h-4 w-[250px]" />
          <Skeleton class="h-4 w-[200px]" />
          <Skeleton class="h-4 w-[150px]" />
        </div>
      </div>
    </div>

    <!-- Main Layout -->
    <div v-else class="flex min-h-screen">
      <!-- Sidebar -->
      <Sidebar v-if="authStore.isAuthenticated" />

      <div class="flex-1">
        <!-- Top Navigation -->
        <nav 
          v-if="authStore.isAuthenticated" 
          class="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        >
          <div class="flex h-[60px] items-center justify-between px-4">
            <router-link 
              to="/" 
              class="flex items-center space-x-2 transition-colors hover:text-primary"
            >
              <span class="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Mini Notion
              </span>
            </router-link>
            
            <div class="flex items-center gap-4">
              <div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50">
                <div class="size-2 rounded-full bg-green-500 animate-pulse" />
                <span class="text-sm text-muted-foreground">
                  {{ authStore.user?.email }}
                </span>
              </div>
                <Button 
                @click="handleLogout"
                variant="ghost"
                size="sm"
                class="relative group overflow-hidden"
                >
                <span class="relative z-10 transition-colors duration-300 group-hover:text-white">
                  Logout
                </span>
                <div 
                  class="absolute inset-0 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-md bg-gradient-to-r from-red-500 via-orange-500 to-red-600 opacity-80"
                />
              </Button>
            </div>
          </div>
        </nav>

        <!-- Main Content -->
        <main class="flex-1">
          <router-view v-slot="{ Component }">
            <Transition
              enter-active-class="transition-all duration-300 ease-out"
              enter-from-class="opacity-0 translate-y-4"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition-all duration-200 ease-in"
              leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 translate-y-4"
            >
              <component :is="Component" />
            </Transition>
          </router-view>
        </main>
      </div>
    </div>
  </div>
</template>
