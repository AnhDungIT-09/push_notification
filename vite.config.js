import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import tailwindcss from "@tailwindcss/vite";
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Ứng dụng nha khoa",
        short_name: "Nha Khoa",
        // description: "Mô tả ứng dụng của bạn",
        theme_color: "#ffffff",
        display: "standalone", // Rất quan trọng, phải là 'standalone', 'fullscreen', 'minimal-ui'
        scope: "/", // Đảm bảo scope bao gồm tất cả các trang của bạn
        start_url: "/",
        icons: [
          {
            src: "alarm-bell.png", // <--- Use a real PNG icon here
            sizes: "192x192",
            type: "image/png", // <--- Specify the correct image type
          },
          {
            src: "alarm-bell.png", // <--- Use a real PNG icon here
            sizes: "512x512",
            type: "image/png", // <--- Specify the correct image type
          },
          {
            src: "alarm-bell.png", // <--- Use a maskable PNG icon here
            sizes: "512x512",
            type: "image/png", // <--- Specify the correct image type
            purpose: "any maskable",
          },
        ],
      },
      // Các tùy chọn khác cho Workbox
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,woff2}"],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
      devOptions: {
        enabled: true, // Bật trong môi trường dev để dễ dàng kiểm thử
      },
    }),
  ],
});
