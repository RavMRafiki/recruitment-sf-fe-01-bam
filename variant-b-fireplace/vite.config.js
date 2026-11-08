import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  build: {
    rollupOptions: {
      input: {
        left: "left.html",
        preview: "preview.html",
        right: "right.html",
        top: "top.html",
      },
    },
  },
});
