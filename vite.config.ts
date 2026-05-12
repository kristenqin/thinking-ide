import { resolve } from "node:path";
import { build as viteBuild, defineConfig, type InlineConfig, type PluginOption } from "vite";
import react from "@vitejs/plugin-react";

const output = {
  entryFileNames: "[name].js",
  chunkFileNames: "assets/[name]-[hash].js",
  assetFileNames: "assets/[name]-[hash][extname]"
};

function createBaseConfig() {
  return {
    plugins: [react()],
    esbuild: {
      charset: "ascii" as const
    }
  };
}

function createSubBuildConfig(input: Record<string, string>): InlineConfig {
  return {
    configFile: false,
    publicDir: false,
    ...createBaseConfig(),
    build: {
      outDir: "dist",
      emptyOutDir: false,
      sourcemap: false,
      rollupOptions: {
        input,
        output
      }
    }
  };
}

function additionalExtensionBuilds(): PluginOption {
  return {
    name: "thinking-ide-additional-extension-builds",
    apply: "build",
    async closeBundle() {
      await viteBuild(
        createSubBuildConfig({
          background: "src/extension/background.ts"
        })
      );

      await viteBuild(
        createSubBuildConfig({
          sidepanel: resolve(__dirname, "sidepanel.html")
        })
      );
    }
  };
}

export default defineConfig({
  ...createBaseConfig(),
  plugins: [...(createBaseConfig().plugins ?? []), additionalExtensionBuilds()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      input: {
        content: "src/extension/content.tsx"
      },
      output
    }
  }
});
