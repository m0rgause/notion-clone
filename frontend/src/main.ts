import { createApp } from "vue";
import { createPinia } from "pinia";
import router from "./router";
import App from "./App.vue";
import "./index.css";
import axios from "axios";
import persistedState from "pinia-plugin-persistedstate";

// Configure axios defaults
axios.defaults.baseURL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";
axios.defaults.withCredentials = true;

const app = createApp(App);
const pinia = createPinia();

pinia.use(persistedState);

app.use(pinia);
app.use(router);

app.mount("#app");
