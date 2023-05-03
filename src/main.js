import { createApp } from "vue";
import App from "./App.vue";
import VueSSE from "vue-sse";

import "./assets/main.css";

createApp(App)
	.use(VueSSE, {
		format: "json",
		withCredentials: false,
		polyfill: true,
	})
	.mount("#app");
