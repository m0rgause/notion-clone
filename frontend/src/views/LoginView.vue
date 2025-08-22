<template>
  <div class="min-h-screen relative flex items-center justify-center">
    <!-- Background gradient -->
    <div class="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/20" />
    
    <!-- Animated circles -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute -left-4 -top-4 h-64 w-64 rounded-full bg-primary/10 blur-3xl animate-pulse" />
      <div class="absolute -right-4 -bottom-4 h-64 w-64 rounded-full bg-secondary/10 blur-3xl animate-pulse delay-700" />
    </div>

    <!-- Main content -->
    <div class="container relative z-10 mx-auto flex flex-col items-center justify-center px-4">
      <div class="w-full max-w-[400px] space-y-8">
        <!-- Logo or title -->
        <div class="text-center space-y-2">
          <h1 class="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Mini Notion
          </h1>
          <p class="text-muted-foreground">Your ideas, organized beautifully</p>
        </div>

        <Card class="border-2 border-border/50 bg-card/50 backdrop-blur-xl shadow-xl">
          <CardHeader>
            <CardTitle class="text-xl font-semibold bg-gradient-to-r from-primary/80 to-secondary/80 bg-clip-text text-transparent">
              Welcome back
            </CardTitle>
            <CardDescription>
              Enter your credentials to access your workspace
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form @submit="onSubmit" class="space-y-6">
              <div class="space-y-4">
                <FormField name="email" v-slot="{componentField}">
                  <FormItem>
                    <FormLabel class="text-foreground/70">Email</FormLabel>
                    <FormControl>
                      <Input
                        v-bind="componentField"
                        type="email"
                        placeholder="name@example.com"
                        autocomplete="email"
                        class="bg-card/50 border-border/50 backdrop-blur-sm focus:ring-primary/50"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>

                <FormField name="password" v-slot="{componentField}">
                  <FormItem>
                    <FormLabel class="text-foreground/70">Password</FormLabel>
                    <FormControl>
                      <Input
                        v-bind="componentField"
                        type="password"
                        placeholder="Enter your password"
                        autocomplete="current-password"
                        class="bg-card/50 border-border/50 backdrop-blur-sm focus:ring-primary/50"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>
              </div>
              
              <Button 
                type="submit" 
                class="w-full font-semibold relative overflow-hidden group transition-all"
                size="lg"
                :disabled="loading"
              >
                <span class="relative z-10">
                  {{ loading ? 'Signing in...' : 'Sign in' }}
                </span>
                <div class="absolute inset-0 bg-gradient-to-r from-primary/80 to-secondary transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </Button>
            </form>
          </CardContent>
          <CardFooter class="flex flex-col space-y-4 pb-6">
            <div class="relative">
              <div class="absolute inset-0 flex items-center">
                <span class="w-full border-t border-border/50" />
              </div>
              <div class="relative flex justify-center text-xs uppercase">
                <span class="bg-card/80 px-2 text-muted-foreground backdrop-blur-sm">
                  New here?
                </span>
              </div>
            </div>
            <router-link
              to="/register"
              class="text-sm text-center text-muted-foreground hover:text-primary transition-colors underline-offset-4 hover:underline inline-flex items-center justify-center group"
            >
              Create an account
              <span class="inline-block transition-transform group-hover:translate-x-1 ml-1">
                →
              </span>
            </router-link>
          </CardFooter>
        </Card>

        <Alert 
          variant="destructive" 
          v-if="error"
          class="animate-in fade-in-50 slide-in-from-bottom-5 bg-destructive/90 backdrop-blur-sm border-destructive/50"
        >
          <AlertTitle class="font-medium">Error</AlertTitle>
          <AlertDescription>
            {{ error }}
          </AlertDescription>
        </Alert>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import {  useForm } from 'vee-validate';
import * as z from 'zod';
import { toTypedSchema } from '@vee-validate/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import FormMessage from '@/components/ui/form/FormMessage.vue';

const router = useRouter();
const authStore = useAuthStore();
const loading = ref(false);
const error = ref('');

const formSchema = toTypedSchema(z.object({
  email: z.string().email('Invalid email address').nonempty('Email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters long')
}));

const form = useForm({
  validationSchema: formSchema
});


const onSubmit = form.handleSubmit(async(values) => {
  loading.value = true;
  error.value = '';

  const { email, password } = values;

  try {
    await authStore.login(email, password);
    router.push('/notes');
  } catch (err: any) {
    error.value = err.message || 'Login failed. Please try again.';
  } finally {
    loading.value = false;
  }
});

// const handleLogin = async (values: any) => {
//   loading.value = true;
//   error.value = '';

//   const { email, password } = values;

//   console.log('Logging in with:', email);
//   console.log('Password:', password);

//   try {
//   //   const response = await authStore.login(email, password);
//   // console.log('Login response:', response);
//   } catch (err: any) {
//   //   error.value = err.message;
//   } finally {
//     loading.value = false;
//   }
// };
</script>
