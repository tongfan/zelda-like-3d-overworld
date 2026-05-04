/// <reference types="vitest" />
import { defineConfig } from "vite";

export default defineConfig({
  base: "/zelda-like-3d-overworld/",
  test: {
    environment: "node",
    globals: true
  }
});
