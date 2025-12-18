import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import viteCompression from "vite-plugin-compression";
import tsconfigPaths from "vite-tsconfig-paths";
import svgr from "vite-plugin-svgr";
import { viteAddBasePlugin } from "./plugins/vite-base-plugin";

export default defineConfig({
  base: "./",
  plugins: [
    tsconfigPaths(),
    react(),
    viteAddBasePlugin(),
    svgr(),
    viteCompression(),
  ],
  build: {
    reportCompressedSize: false,
  },
  server: {
    proxy: {
      "/api/": {
        target: "http://localhost:3499/",
        changeOrigin: true,
      },
    },
  },
});
