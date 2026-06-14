// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins...
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  // Add Vite-specific configuration here (this will be merged)
  vite: {
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:5000', // Your Express backend port
          changeOrigin: true,
          secure: false,
        },
      },
    },
  },
});