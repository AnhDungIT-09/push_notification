// sw.js - Đặt file này trong thư mục public/

self.addEventListener("install", (event) => {
  console.log("Service Worker: Installed");
  // Skip waiting để active ngay lập tức
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activated");
  // Claim tất cả clients
  event.waitUntil(self.clients.claim());
});

// Lắng nghe push events
self.addEventListener("push", (event) => {
  console.log("Service Worker: Push received", event);

  let data = {};
  if (event.data) {
    data = event.data.json();
  }

  const options = {
    body: data.body || "Bạn có thông báo mới!",
    icon: data.icon || "/icon-192.png",
    badge: data.badge || "/badge-72.png",
    tag: data.tag || "default",
    data: data.data || {},
    actions: [
      {
        action: "open",
        title: "Mở",
      },
      {
        action: "close",
        title: "Đóng",
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "Thông báo mới", options)
  );
});

// Xử lý click notification
self.addEventListener("notificationclick", (event) => {
  console.log("Service Worker: Notification clicked", event);

  event.notification.close();

  if (event.action === "close") {
    return;
  }

  // Mở hoặc focus vào window
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === "/" && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow("/");
      }
    })
  );
});

// Lắng nghe message từ main thread
self.addEventListener("message", (event) => {
  console.log("Service Worker: Message received", event.data);

  if (event.data.type === "SHOW_NOTIFICATION") {
    const { data } = event.data;

    const options = {
      body: data.body || "Thông báo test",
      icon: data.icon || "/icon-192.png",
      badge: data.badge || "/badge-72.png",
      tag: data.tag || "test",
      data: data.data || {},
    };

    self.registration.showNotification(data.title || "Test", options);
  }
});
