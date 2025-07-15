// public/sw.js
// FILE NÀY KHÔNG CHỨA BẤT KỲ MÃ REACT HAY KHỞI TẠO DOM NÀO.
// Nó chỉ chứa các Event Listener cho Service Worker.

self.addEventListener("install", (event) => {
  console.log("Service Worker: Installed");
  // self.skipWaiting() sẽ buộc Service Worker mới kích hoạt ngay lập tức,
  // bỏ qua giai đoạn 'waiting' và kiểm soát các client hiện có.
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activated");
  // clients.claim() đảm bảo Service Worker kiểm soát tất cả các client (tab)
  // trong phạm vi của nó ngay sau khi kích hoạt.
  event.waitUntil(clients.claim());
});

// Lắng nghe sự kiện 'message' từ trang chính (ví dụ: từ App.jsx)
// Đây là cách trang chính yêu cầu Service Worker hiển thị thông báo.
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "DISPLAY_NOTIFICATION") {
    const { title, body, icon, tag } = event.data;
    console.log(
      "Service Worker: Received message to display notification:",
      event.data
    );
    self.registration
      .showNotification(title, {
        body: body,
        icon: icon,
        tag: tag, // Sử dụng tag được truyền vào để quản lý thông báo
        requireInteraction: false, // Thông báo tự động đóng sau một thời gian ngắn
        vibrate: [200, 100, 200], // Rung khi thông báo xuất hiện (trên thiết bị di động hỗ trợ)
        // badge: 'https://yourdomain.com/badge.png', // Một biểu tượng nhỏ hiển thị trên biểu tượng ứng dụng
      })
      .then(() => {
        console.log("Service Worker: Notification shown successfully.");
      })
      .catch((error) => {
        console.error("Service Worker: Error showing notification:", error);
      });
  }
});

// Lắng nghe sự kiện 'push'
// Đây là sự kiện khi một thông báo đẩy thực sự được gửi từ máy chủ (backend)
// đến trình duyệt của người dùng, ngay cả khi trình duyệt không mở.
self.addEventListener("push", (event) => {
  // Parse dữ liệu từ push message. Đảm bảo backend gửi dữ liệu JSON.
  const data = event.data ? event.data.json() : {};
  console.log("Service Worker: Push received:", data);

  const title = data.title || "Thông báo đẩy mới!";
  const options = {
    body: data.body || "Bạn có một cập nhật mới từ ứng dụng của chúng tôi.",
    icon: data.icon || "https://via.placeholder.com/64", // Icon hiển thị trong thông báo
    tag: data.tag || `push-notification-${Date.now()}`, // Tag duy nhất cho push notification
    requireInteraction: false, // Tự động đóng
    vibrate: [200, 100, 200],
    // actions: [ // Các nút hành động trong thông báo
    //   { action: 'open_url', title: 'Mở ứng dụng' },
    //   { action: 'close', title: 'Đóng' }
    // ],
    data: {
      // Dữ liệu bổ sung có thể truy cập khi click vào thông báo
      url: data.url || "/", // URL để mở khi click vào thông báo
    },
  };

  // Hiển thị thông báo
  event.waitUntil(self.registration.showNotification(title, options));
});

// Lắng nghe sự kiện 'notificationclick'
// Xử lý khi người dùng nhấp vào một thông báo.
self.addEventListener("notificationclick", (event) => {
  console.log("Service Worker: Notification clicked:", event.notification.tag);
  event.notification.close(); // Đóng thông báo sau khi người dùng nhấp vào

  // Mở một cửa sổ mới hoặc tập trung vào một tab hiện có
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      const clickedNotificationUrl = event.notification.data?.url || "/"; // Lấy URL từ data nếu có

      for (const client of clientList) {
        // Kiểm tra nếu có tab nào đang mở ứng dụng và có thể focus vào
        if (client.url.includes(self.location.origin) && "focus" in client) {
          // Nếu thông báo có URL cụ thể và tab đó không phải là URL đó,
          // thì điều hướng tab đó đến URL mong muốn.
          if (
            clickedNotificationUrl !== "/" &&
            client.url !== clickedNotificationUrl
          ) {
            return client
              .navigate(clickedNotificationUrl)
              .then((client) => client.focus());
          }
          return client.focus(); // Nếu không, chỉ cần focus vào tab hiện có
        }
      }
      // Nếu không có tab nào phù hợp hoặc không thể focus, mở một cửa sổ mới
      if (clients.openWindow) {
        return clients.openWindow(clickedNotificationUrl);
      }
    })
  );
});
