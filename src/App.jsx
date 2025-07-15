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

  const testSimpleNotification = async () => {
    // Nếu là iOS, báo không hỗ trợ thông báo đẩy web
    if (isIOS) {
      // Vì bạn chỉ muốn thông báo ngoài trình duyệt, và iOS không hỗ trợ,
      // nên chỉ cần thông báo lỗi hoặc không làm gì cả.
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
      console.log("Permission granted, creating notification...");
      try {
        const notification = new Notification("Thông báo Test", {
          body: "Đây là thông báo đơn giản từ React App!",
          icon: "https://via.placeholder.com/64?text=NT", // Icon cho Notification
          requireInteraction: true, // Yêu cầu người dùng tương tác
          tag: "simple-test-notification",
          vibrate: [200, 100, 200], // Rung (chỉ trên một số trình duyệt)
        });

        console.log("Notification created:", notification);

        notification.onshow = () => console.log("Notification shown");
        notification.onclick = () => {
          console.log("Notification clicked");
          window.focus(); // Tập trung vào tab của ứng dụng khi click
        };
        notification.onerror = (error) =>
          console.error("Notification error:", error);
        notification.onclose = () => console.log("Notification closed");

        setTimeout(() => {
          if (notification) {
            // Đảm bảo notification tồn tại trước khi đóng
            notification.close();
          }
        }, 8000); // Đóng sau 8 giây
      } catch (error) {
        console.error("Error creating notification:", error);
        alert("Lỗi tạo notification: " + error.message); // Sử dụng alert thay vì showMobileAlert
      }
    } else if (Notification.permission === "denied") {
      alert(
        "Quyền thông báo đã bị từ chối. Vui lòng cấp quyền trong cài đặt trình duyệt."
      );
    } else {
      // permission === "default"
      console.log("Permission not granted, requesting...");
      const permission = await requestPermission();
      if (permission === "granted") {
        // Thử lại nếu quyền được cấp
        testSimpleNotification();
      } else {
        alert("Không thể tạo thông báo vì quyền chưa được cấp.");
      }
    }
  };

  // Hàm này để mô phỏng Push Notification bằng Service Worker.
  // ĐỂ CÁI NÀY THỰC SỰ HOẠT ĐỘNG, BẠN CẦN:
  // 1. Một Service Worker file (ví dụ: sw.js) được đăng ký.
  // 2. Một backend server để gửi Web Push Protocol đến Service Worker.
  // 3. Người dùng phải cấp quyền cho Push API.
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

    // Đây là phần giả định, bạn cần thay thế bằng logic đăng ký Push Subscription thật
    // và gửi tin nhắn từ server đến service worker.
    alert(
      "Tính năng này yêu cầu Service Worker và một Backend để gửi Push Notification. Bạn sẽ cần triển khai một giải pháp push notification đầy đủ."
    );
    console.log("Để thực hiện 'Test React Push Notification':");
    console.log("- Đăng ký một Service Worker.");
    console.log("- Đăng ký Push Subscription cho người dùng.");
    console.log("- Gửi Push Message từ server đến Service Worker.");
    console.log("Service Worker sẽ xử lý và hiển thị thông báo.");

    // Ví dụ sơ lược về cách service worker có thể hiển thị thông báo
    // (Đây là client-side, chỉ mang tính minh họa, push thật sự đến từ server)
    if (Notification.permission === "granted" && serviceWorkerSupported) {
      // Gửi một thông điệp tới Service Worker để yêu cầu nó hiển thị thông báo
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: "DISPLAY_NOTIFICATION",
          title: "React Push Test (SW)",
          body: "Thông báo đẩy từ Service Worker!",
          icon: "https://via.placeholder.com/64?text=SW",
        });
        console.log("Đã gửi yêu cầu hiển thị thông báo đến Service Worker.");
      } else {
        console.warn("Chưa có Service Worker nào được kích hoạt.");
        alert(
          "Chưa có Service Worker nào được kích hoạt. Vui lòng tải lại trang hoặc đợi SW cài đặt xong."
        );
      }
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

  // Hàm showMobileAlert giữ lại để hiển thị các thông báo lỗi hoặc cảnh báo
  // mà không cần đến in-app notification.
  // const showMobileAlert = (message) => {
  //   alert(message);
  // };

  // **Đã xóa hàm showInAppNotification**

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
          // Chỉ kích hoạt nếu có hỗ trợ Web Notification
          disabled={!notificationSupported}
        >
          Test Thông báo Đơn giản
        </button>
      </div>

      <div style={{ marginBottom: "10px" }}>
        <button
          onClick={() => {
            try {
              if (
                notificationSupported &&
                Notification.permission === "granted"
              ) {
                const n = new Notification("URGENT TEST!");
                console.log("Minimal notification:", n);
              } else if (Notification.permission === "denied") {
                alert("Quyền thông báo đã bị từ chối.");
              } else {
                alert("Không thể tạo notification. Vui lòng cấp quyền trước.");
              }
            } catch (err) {
              console.error("Error creating minimal notification:", err);
              alert("Lỗi: " + err.message);
            }
          }}
          style={{
            padding: "10px 20px",
            marginRight: "10px",
            backgroundColor: "#ff4444",
            color: "white",
            border: "none",
            borderRadius: "4px",
          }}
          // Chỉ kích hoạt nếu có hỗ trợ Web Notification
          disabled={!notificationSupported}
        >
          Test Thông báo Tối thiểu
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

      {/* **Đã xóa nút Test In-App Notification (Mobile Alternative)** */}

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
