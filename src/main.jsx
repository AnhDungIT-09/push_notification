import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css"; // Giữ lại nếu bạn có file CSS này
import App from "./App.jsx"; // Đảm bảo đường dẫn đến component App của bạn là chính xác

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Đăng ký Service Worker
// Đảm bảo rằng file sw.js nằm trong thư mục PUBLIC của dự án React của bạn
// Đường dẫn "/sw.js" có nghĩa là trình duyệt sẽ tìm file sw.js ở thư mục gốc của domain (ví dụ: https://yourdomain.com/sw.js)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log(
          "Service Worker registered with scope:",
          registration.scope
        );
      })
      .catch((error) => {
        console.error("Service Worker registration failed:", error);
      });
  });
}
