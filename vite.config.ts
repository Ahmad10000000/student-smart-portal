import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/student": {
        target: "https://unfatalistic-adulatory-karter.ngrok-free.dev",
        changeOrigin: true,
        secure: false,
      },
      "/teacher": {
        target: "https://unfatalistic-adulatory-karter.ngrok-free.dev",
        changeOrigin: true,
        secure: false,
      },
      "/admin": {
        target: "https://unfatalistic-adulatory-karter.ngrok-free.dev",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
