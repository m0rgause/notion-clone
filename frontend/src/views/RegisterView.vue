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
          <h1 class="text-2xl font-bold text-gray-900 mb-2">
            Create an account
          </h1>
          <p class="text-gray-600">Start your journey with Notion</p>
        </div>

        <Form @submit="handleRegister" class="space-y-6">
          <div class="space-y-4">
            <FormField name="email" v-slot="{ field, errorMessage }">
              <FormItem>
                <FormLabel class="text-sm font-medium text-gray-700"
                  >Email</FormLabel
                >
                <FormControl>
                  <Input
                    id="email"
                    v-bind="field"
                    type="email"
                    placeholder="Enter your email"
                    autocomplete="email"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  />
                </FormControl>
                <FormDescription
                  v-if="errorMessage"
                  class="text-red-600 text-sm"
                >
                  {{ errorMessage }}
                </FormDescription>
              </FormItem>
            </FormField>

            <FormField name="password" v-slot="{ field, errorMessage }">
              <FormItem>
                <FormLabel class="text-sm font-medium text-gray-700"
                  >Password</FormLabel
                >
                <FormControl>
                  <Input
                    id="password"
                    v-bind="field"
                    type="password"
                    placeholder="Create a password"
                    autocomplete="new-password"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  />
                </FormControl>
                <FormDescription
                  :class="{
                    'text-red-600': errorMessage,
                    'text-gray-500': !errorMessage,
                  }"
                  class="text-sm"
                >
                  {{ errorMessage || "At least 8 characters" }}
                </FormDescription>
              </FormItem>
            </FormField>
          </div>

          <Button
            type="submit"
            class="w-full py-2 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            :disabled="loading"
          >
            {{ loading ? "Creating account..." : "Create account" }}
          </Button>
        </Form>

        <!-- Sign in link -->
        <div class="mt-4 text-center">
          <p class="text-sm text-gray-500">
            Already have an account?
            <router-link to="/login" class="text-gray-900 hover:underline ml-1"
              >Sign in</router-link
            >
          </p>
        </div>

        <!-- Error Display -->
        <div
          v-if="error"
          class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg"
        >
          <p class="text-sm text-red-600">{{ error }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { useForm } from "vee-validate";
import * as z from "zod";
import { toTypedSchema } from "@vee-validate/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form } from "@/components/ui/form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";

const router = useRouter();
const authStore = useAuthStore();
const loading = ref(false);
const error = ref("");

const formSchema = toTypedSchema(
  z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
  })
);

useForm({
  validationSchema: formSchema,
  initialValues: {
    email: "",
    password: "",
  },
});

const handleRegister = async (values: any) => {
  loading.value = true;
  error.value = "";

  try {
    await authStore.register(values.email, values.password);
    router.push("/");
  } catch (err: any) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};
</script>
