// service-worker.js
self.addEventListener("install", (event) => {
  console.log("Service Worker: Installed");
  self.skipWaiting(); // Kích hoạt Service Worker mới ngay lập tức
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activated");
  event.waitUntil(clients.claim()); // Đảm bảo Service Worker kiểm soát tất cả các client
});

// Lắng nghe sự kiện 'message' từ trang chính
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
        tag: tag,
        requireInteraction: true,
        vibrate: [200, 100, 200],
      })
      .then(() => {
        console.log("Service Worker: Notification shown successfully.");
      })
      .catch((error) => {
        console.error("Service Worker: Error showing notification:", error);
      });
  }
});

// Lắng nghe sự kiện 'push' (nếu bạn muốn triển khai push notifications thực sự từ server)
self.addEventListener("push", (event) => {
  const data = event.data.json();
  console.log("Service Worker: Push received:", data);
  const title = data.title || "Thông báo đẩy";
  const options = {
    body: data.body || "Bạn có một tin nhắn mới.",
    icon: data.icon || "https://via.placeholder.com/64",
    tag: data.tag || "push-notification",
    requireInteraction: true,
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// Lắng nghe sự kiện 'notificationclick'
self.addEventListener("notificationclick", (event) => {
  console.log("Service Worker: Notification clicked:", event.notification.tag);
  event.notification.close(); // Đóng thông báo sau khi click

  // Mở một URL hoặc tập trung vào một tab hiện có
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow("/"); // Mở trang chính nếu chưa có tab nào mở
      }
    })
  );
});
