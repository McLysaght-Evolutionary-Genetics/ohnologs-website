import path from "path";
import { sveltekit } from "@sveltejs/kit/vite";
import type { UserConfig } from "vite";

const config: UserConfig = {
  plugins: [sveltekit()],
  resolve: {
    alias: {
      $zod: path.resolve(process.cwd(), "prisma", "zod"),
    },
  },
  server: {
    port: 3000,
    strictPort: false,
    fs: {
      allow: [path.resolve(process.cwd(), "prisma", "zod")],
    },
  },
  preview: {
    port: 3000,
    strictPort: false,
  },
};

export default config;
