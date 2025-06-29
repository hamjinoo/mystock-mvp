import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/mystock-mvp/",
  build: {
    outDir: "dist",
    sourcemap: true,
    target: "esnext",
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // React 관련 패키지들을 하나의 청크로 묶어서 안전하게 처리
          react: ["react", "react-dom", "react-router-dom"],
          // 차트 라이브러리
          charts: ["chart.js", "react-chartjs-2", "recharts"],
          // 데이터베이스
          dexie: ["dexie"],
          // UI 라이브러리
          ui: ["@headlessui/react", "@heroicons/react", "@hello-pangea/dnd"],
          // 마크다운
          markdown: ["react-markdown"],
          // 기타 유틸리티
          utils: ["zod", "ajv", "ajv-keywords"],
        },
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  resolve: {
    dedupe: ["react", "react-dom"],
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom"],
  },
});
