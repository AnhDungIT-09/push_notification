import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css"; // Giữ lại nếu bạn có file CSS này
import App from "./App.jsx"; // Đảm bảo đường dẫn đến component App của bạn là chính xác

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
