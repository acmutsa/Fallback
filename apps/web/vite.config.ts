// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { cloudflare } from "@cloudflare/vite-plugin";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  resolve:{
    alias:{
      "@":path.resolve(__dirname, "src")
    },
  },
  envDir: process.env.NODE_ENV !== "production" ? "../../" : undefined, // this may break when deploying. Def come back to this
  plugins: [
    // Please make sure that '@tanstack/router-plugin' is passed before '@vitejs/plugin-react'
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react(),
    cloudflare(),
    tailwindcss(),
  ],
  server:{
    cors:false,
    
  }
});

// TODO: Come back and look for a way to validate the environment variables before the app starts up and fail if they are not validated
// TODO: Add intellisense for import.meta.env - https://vite.dev/guide/env-and-mode.html#intellisense-for-typescript