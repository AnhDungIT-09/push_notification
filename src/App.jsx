import React, { useEffect, useState } from "react";

function App() {
  const [permissionStatus, setPermissionStatus] = useState("default");
  const [isMobile, setIsMobile] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [notificationSupported, setNotificationSupported] = useState(false);
  const [error, setError] = useState(null);
  const [serviceWorkerSupported, setServiceWorkerSupported] = useState(false);

  useEffect(() => {
    try {
      const userAgent = navigator.userAgent || "";
      const mobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          userAgent
        );
      const iOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;

      setIsMobile(mobile);
      setIsIOS(iOS);

      // Kiểm tra hỗ trợ notification API (không bao gồm iOS Safari)
      const supported =
        typeof Notification !== "undefined" &&
        typeof Notification.requestPermission === "function" &&
        !iOS; // iOS Safari không hỗ trợ Web Notifications thông thường

      setNotificationSupported(supported);

      // Kiểm tra hỗ trợ Service Worker API
      const swSupported = "serviceWorker" in navigator;
      setServiceWorkerSupported(swSupported);

      // Cập nhật permission status an toàn
      if (typeof Notification !== "undefined") {
        setPermissionStatus(Notification.permission || "default");
      }

      console.log("Device info:", {
        mobile,
        iOS,
        supported,
        swSupported,
        userAgent,
        notificationAPI: typeof Notification !== "undefined",
        currentPermission: Notification.permission,
      });
    } catch (err) {
      console.error("Error in useEffect:", err);
      setError(err.message);
    }
  }, []);

  const requestPermission = async () => {
    // Nếu là iOS, báo không hỗ trợ thông báo đẩy web
    if (isIOS) {
      alert("iOS Safari không hỗ trợ Web Notifications thông thường.");
      return "denied";
    }

    if (!notificationSupported) {
      alert("Trình duyệt/thiết bị này không hỗ trợ Web Notifications.");
      return "denied";
    }

    console.log("Requesting permission...");
    try {
      const permission = await Notification.requestPermission();
      console.log("Permission result:", permission);
      setPermissionStatus(permission);
      return permission;
    } catch (error) {
      console.error("Error requesting permission:", error);
      setError("Lỗi khi xin quyền: " + error.message);
      return "denied";
    }
  };

  const showNotificationViaServiceWorker = (title, body, icon, tag) => {
    if (!serviceWorkerSupported) {
      alert("Trình duyệt không hỗ trợ Service Worker.");
      return;
    }
    if (Notification.permission !== "granted") {
      alert("Quyền thông báo chưa được cấp.");
      return;
    }

    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: "DISPLAY_NOTIFICATION",
        title,
        body,
        icon,
        tag,
      });
      console.log("Đã gửi yêu cầu hiển thị thông báo đến Service Worker.");
    } else {
      alert(
        "Service Worker chưa được kích hoạt. Vui lòng tải lại trang hoặc đợi SW cài đặt xong."
      );
      console.warn("Chưa có Service Worker nào được kích hoạt.");
    }
  };

  const testSimpleNotification = async () => {
    // Nếu là iOS, báo không hỗ trợ thông báo đẩy web
    if (isIOS) {
      alert("iOS Safari không hỗ trợ Web Notifications thông thường.");
      return;
    }

    if (!notificationSupported) {
      alert("Thiết bị này không hỗ trợ Web Notifications.");
      return;
    }

    console.log("Testing simple notification...");
    console.log("Current permission:", Notification.permission);

    // Kiểm tra quyền trước khi tạo thông báo
    if (Notification.permission === "granted") {
      console.log(
        "Permission granted, attempting to display notification via Service Worker..."
      );
      showNotificationViaServiceWorker(
        "Thông báo Test",
        "Đây là thông báo đơn giản từ React App!",
        "https://via.placeholder.com/64?text=NT",
        "simple-test-notification"
      );
    } else if (Notification.permission === "denied") {
      alert(
        "Quyền thông báo đã bị từ chối. Vui lòng cấp quyền trong cài đặt trình duyệt."
      );
    } else {
      // permission === "default"
      console.log("Permission not granted, requesting...");
      const permission = await requestPermission();
      if (permission === "granted") {
        testSimpleNotification(); // Thử lại nếu quyền được cấp
      } else {
        alert("Không thể tạo thông báo vì quyền chưa được cấp.");
      }
    }
  };

  const testMinimalNotification = async () => {
    if (isIOS) {
      alert("iOS Safari không hỗ trợ Web Notifications thông thường.");
      return;
    }
    if (!notificationSupported) {
      alert("Thiết bị này không hỗ trợ Web Notifications.");
      return;
    }

    if (Notification.permission === "granted") {
      showNotificationViaServiceWorker(
        "URGENT TEST!",
        "Đây là một thông báo tối thiểu.",
        "https://via.placeholder.com/64?text=MIN",
        "minimal-test-notification"
      );
    } else if (Notification.permission === "denied") {
      alert("Quyền thông báo đã bị từ chối.");
    } else {
      alert("Không thể tạo notification. Vui lòng cấp quyền trước.");
    }
  };

  // Hàm này để mô phỏng Push Notification bằng Service Worker.
  // ĐỂ CÁI NÀY THỰC SỰ HOẠT ĐỘNG, BẠN CẦN:
  // 1. Một Service Worker file (ví dụ: sw.js) được đăng ký. (Đã làm ở trên)
  // 2. Một backend server để gửi Web Push Protocol đến Service Worker. (Chưa làm)
  // 3. Người dùng phải cấp quyền cho Push API. (Đã làm với Notification.requestPermission)
  const testReactPushNotification = async () => {
    if (isIOS && !serviceWorkerSupported) {
      alert(
        "iOS Safari không hỗ trợ Web Notifications thông thường. Để nhận Push Notifications trên iOS, cần sử dụng Service Worker và APNs (Apple Push Notification service), rất phức tạp."
      );
      return;
    }
    if (!serviceWorkerSupported) {
      alert(
        "Trình duyệt này không hỗ trợ Service Worker, không thể thử Push Notification."
      );
      return;
    }

    // Phần này vẫn cần server-side logic để gửi Push Notification
    alert(
      "Để thực hiện 'Test React Push Notification', bạn cần một Backend để gửi Push Notification theo chuẩn Web Push Protocol đến Service Worker đã đăng ký."
    );
    console.log("Để thực hiện 'Test React Push Notification':");
    console.log("- Đăng ký Push Subscription cho người dùng."); // Cần gọi navigator.serviceWorker.ready.then(reg => reg.pushManager.subscribe(...))
    console.log("- Gửi Push Message từ server đến Service Worker.");
    console.log("Service Worker sẽ xử lý và hiển thị thông báo.");

    // Ví dụ sơ lược về cách service worker có thể hiển thị thông báo ngay lập tức
    // (Đây không phải là push thật sự từ server, mà là tạo thông báo từ client qua SW)
    if (Notification.permission === "granted" && serviceWorkerSupported) {
      showNotificationViaServiceWorker(
        "React Push Test (SW)",
        "Đây là thông báo đẩy mô phỏng từ Service Worker!",
        "https://via.placeholder.com/64?text=SW",
        "react-push-test"
      );
    } else if (Notification.permission === "denied") {
      alert(
        "Quyền thông báo bị từ chối. Không thể gửi push qua Service Worker."
      );
    } else {
      const permission = await requestPermission();
      if (permission === "granted") {
        testReactPushNotification(); // Thử lại sau khi cấp quyền
      } else {
        alert("Không thể gửi push vì quyền chưa được cấp.");
      }
    }
  };

  // Hiển thị lỗi nếu có
  if (error) {
    return (
      <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
        <h2>Notification Test</h2>
        <div
          style={{
            background: "#f8d7da",
            border: "1px solid #f5c6cb",
            padding: "15px",
            borderRadius: "5px",
            color: "#721c24",
          }}
        >
          <strong>❌ Lỗi:</strong> {error}
        </div>
      </div>
    );
  }

  return (
    <div
      className="page"
      style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}
    >
      <h2>Notification Test</h2>

      {/* Thông báo cho iOS */}
      {isIOS && (
        <div
          style={{
            background: "#fff3cd",
            border: "1px solid #ffeaa7",
            padding: "15px",
            borderRadius: "5px",
            marginBottom: "20px",
            color: "#856404",
          }}
        >
          <strong>⚠️ iOS Safari:</strong> Web Notifications **không được hỗ
          trợ**. Để có thông báo đẩy trên iOS, bạn cần triển khai **Push
          Notifications với Service Worker và APNs (Apple Push Notification
          service)**, điều này phức tạp hơn nhiều.
        </div>
      )}

      {/* Thông báo cho mobile Android */}
      {isMobile && !isIOS && (
        <div
          style={{
            background: "#d4edda",
            border: "1px solid #c3e6cb",
            padding: "15px",
            borderRadius: "5px",
            marginBottom: "20px",
            color: "#155724",
          }}
        >
          <strong>📱 Mobile (Android):</strong> Thông báo web được hỗ trợ. Nếu
          không thấy thông báo, hãy kiểm tra cài đặt quyền thông báo của trình
          duyệt của bạn.
        </div>
      )}

      <div style={{ marginBottom: "20px" }}>
        <strong>Trạng thái quyền:</strong> {permissionStatus}
        <br />
        <strong>Thiết bị:</strong>{" "}
        {isMobile ? (isIOS ? "iOS" : "Android") : "Máy tính để bàn"}
        <br />
        <strong>Hỗ trợ Web Notification:</strong>{" "}
        {notificationSupported ? "Có" : "Không (trên iOS Safari)"}
        <br />
        <strong>Hỗ trợ Service Worker:</strong>{" "}
        {serviceWorkerSupported ? "Có" : "Không"}
      </div>

      <div style={{ marginBottom: "10px" }}>
        <button
          onClick={requestPermission}
          style={{ padding: "10px 20px", marginRight: "10px" }}
          // Vô hiệu hóa nếu không hỗ trợ Web Notification hoặc đã được cấp quyền
          disabled={!notificationSupported || permissionStatus === "granted"}
        >
          {permissionStatus === "granted"
            ? "Đã cấp quyền"
            : "Yêu cầu cấp quyền"}
        </button>
      </div>

      <div style={{ marginBottom: "10px" }}>
        <button
          onClick={testSimpleNotification}
          style={{ padding: "10px 20px", marginRight: "10px" }}
          // Chỉ kích hoạt nếu có hỗ trợ Web Notification VÀ Service Worker
          disabled={!notificationSupported || !serviceWorkerSupported}
        >
          Test Thông báo Đơn giản (qua SW)
        </button>
      </div>

      <div style={{ marginBottom: "10px" }}>
        <button
          onClick={testMinimalNotification}
          style={{
            padding: "10px 20px",
            marginRight: "10px",
            backgroundColor: "#ff4444",
            color: "white",
            border: "none",
            borderRadius: "4px",
          }}
          // Chỉ kích hoạt nếu có hỗ trợ Web Notification VÀ Service Worker
          disabled={!notificationSupported || !serviceWorkerSupported}
        >
          Test Thông báo Tối thiểu (qua SW)
        </button>
      </div>

      {/* Nút này liên quan đến Push API và Service Worker */}
      <div style={{ marginBottom: "10px" }}>
        <button
          onClick={testReactPushNotification}
          style={{
            padding: "10px 20px",
            marginRight: "10px",
            backgroundColor: "#007bff", // Màu xanh dương cho Push Notification
            color: "white",
            border: "none",
            borderRadius: "4px",
          }}
          // Kích hoạt nếu Service Worker được hỗ trợ
          disabled={!serviceWorkerSupported}
        >
          Test React Push Notification (Cần SW & Backend)
        </button>
      </div>

      <div style={{ marginTop: "20px", fontSize: "14px", color: "#666" }}>
        <strong>Thông tin Debug:</strong>
        <br />- URL hiện tại: {window.location.href}
        <br />- Giao thức: {window.location.protocol}
        <br />- Tên máy chủ: {window.location.hostname}
        <br />- User Agent: {navigator.userAgent}
        <br />- HTTPS: {window.location.protocol === "https:" ? "Có" : "Không"}
        <br />- Localhost:{" "}
        {window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1"
          ? "Có"
          : "Không"}
        <br />- API Notification hỗ trợ:{" "}
        {typeof Notification !== "undefined" ? "Có" : "Không"}
        <br />- ServiceWorker hỗ trợ:{" "}
        {"serviceWorker" in navigator ? "Có" : "Không"}
        <br />-{" "}
        <strong
          style={{
            color:
              window.location.protocol === "https:" ||
              window.location.hostname === "localhost" ||
              window.location.hostname === "127.0.0.1"
                ? "green"
                : "red",
          }}
        >
          Thông báo Web sẽ hoạt động:{" "}
          {window.location.protocol === "https:" ||
          window.location.hostname === "localhost" ||
          window.location.hostname === "127.0.0.1"
            ? "CÓ"
            : "KHÔNG - Cần HTTPS hoặc localhost"}
        </strong>
      </div>

      <div style={{ marginTop: "20px", fontSize: "12px", color: "#999" }}>
        <strong>Console Log:</strong> Mở F12 → Console để xem thông báo debug
      </div>
    </div>
  );
}

export default App;
