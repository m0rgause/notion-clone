<template>
  <div class="min-h-screen bg-white flex flex-col">
    <!-- Header -->
    <div class="px-6 py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <div class="w-6 h-6 bg-gray-900 rounded"></div>
          <span class="text-lg font-semibold text-gray-900">Mini Notion</span>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex items-center justify-center px-6 py-12">
      <div class="w-full max-w-sm">
        <div class="text-center mb-8">
          <h1 class="text-2xl font-bold text-gray-900 mb-2">Welcome back</h1>
          <p class="text-gray-600">Sign in to your account</p>
        </div>

        <!-- Error Display -->
        <div
          v-if="error"
          class="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg"
        >
          <p class="text-sm text-red-600">{{ error }}</p>
        </div>

        <form @submit="onSubmit" class="space-y-6">
          <div class="space-y-4">
            <FormField name="email" v-slot="{ componentField }">
              <FormItem>
                <FormLabel class="text-sm font-medium text-gray-700"
                  >Email</FormLabel
                >
                <FormControl>
                  <Input
                    v-bind="componentField"
                    type="email"
                    placeholder="Enter your email"
                    autocomplete="email"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField name="password" v-slot="{ componentField }">
              <FormItem>
                <FormLabel class="text-sm font-medium text-gray-700"
                  >Password</FormLabel
                >
                <FormControl>
                  <Input
                    v-bind="componentField"
                    type="password"
                    placeholder="Enter your password"
                    autocomplete="current-password"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>
          </div>

          <Button
            type="submit"
            class="w-full py-2 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            :disabled="loading"
          >
            {{ loading ? "Signing in..." : "Sign in" }}
          </Button>
        </form>

        <!-- Sign up link -->
        <div class="mt-4 text-center">
          <p class="text-sm text-gray-500">
            Don't have an account?
            <router-link
              to="/register"
              class="text-gray-900 hover:underline ml-1"
              >Sign up</router-link
            >
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { useToast } from "@/composables/useToast";
import { useForm } from "vee-validate";
import * as z from "zod";
import { toTypedSchema } from "@vee-validate/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import FormMessage from "@/components/ui/form/FormMessage.vue";
import api from "@/service/axios";

const router = useRouter();
const authStore = useAuthStore();
const { success, error: showErrorToast } = useToast();
const loading = ref(false);
const error = ref("");

const formSchema = toTypedSchema(
  z.object({
    email: z
      .string()
      .email("Invalid email address")
      .nonempty("Email is required"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
  })
);

const form = useForm({
  validationSchema: formSchema,
});

const onSubmit = form.handleSubmit(async (values) => {
  loading.value = true;
  error.value = "";

  const { email, password } = values;

  try {
    // await authStore.login(email, password);
    const response = await api.post("/auth/login", { email, password });
    authStore.user = response.data.user;
    authStore.isAuthenticated = true;

    // Show success toast
    success("Successfully signed in! Welcome back.");

    // Small delay to show toast before navigation
    setTimeout(() => {
      router.push("/");
    }, 500);
  } catch (err: any) {
    let errorMessage =
      "Login failed. Please check your connection and try again.";

    if (err.response) {
      errorMessage =
        err.response.data?.message || "Invalid credentials. Please try again.";
    } else if (err.message) {
      errorMessage = err.message;
    }

    // Show both error message in form and toast
    error.value = errorMessage;
    showErrorToast(errorMessage);
  } finally {
    loading.value = false;
  }
});
</script>
