// Service Worker với background sync và tự động gửi thông báo
self.addEventListener("push", (event) => {
  let pushData = event.data.json();
  if (!pushData || !pushData.title) {
    console.error(
      "Received WebPush with an empty title. Received body: ",
      pushData
    );
    return;
  }

  event.waitUntil(
    self.registration.showNotification(pushData.title, pushData).then(() => {
      console.log("Push notification shown:", pushData.title);
      // Track notification show
      // fetch('/api/track-show?message_id=' + pushData.data.message_id);
    })
  );
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  if (!event.notification.data) {
    console.error(
      "Click on WebPush with empty data, where url should be. Notification: ",
      event.notification
    );
    return;
  }
  if (!event.notification.data.url) {
    console.error(
      "Click on WebPush without url. Notification: ",
      event.notification
    );
    return;
  }

  event.waitUntil(
    clients.openWindow(event.notification.data.url).then(() => {
      console.log("Window opened from notification click");
      // Track notification click
      // fetch('/api/track-click?message_id=' + event.notification.data.message_id);
    })
  );
});

// Background sync để gửi thông báo định kỳ
self.addEventListener("sync", function (event) {
  if (event.tag === "auto-notification") {
    event.waitUntil(sendAutoNotification());
  }
});

// Message handler để communicate với main thread
self.addEventListener("message", function (event) {
  if (event.data && event.data.type === "START_AUTO_NOTIFICATIONS") {
    startPeriodicNotifications();
  } else if (event.data && event.data.type === "STOP_AUTO_NOTIFICATIONS") {
    stopPeriodicNotifications();
  }
});

let notificationInterval;

function startPeriodicNotifications() {
  // Clear existing interval
  if (notificationInterval) {
    clearInterval(notificationInterval);
  }

  // Start sending notifications every 5 seconds
  notificationInterval = setInterval(() => {
    sendBackgroundNotification();
  }, 5000);

  console.log("Started periodic notifications");
}

function stopPeriodicNotifications() {
  if (notificationInterval) {
    clearInterval(notificationInterval);
    notificationInterval = null;
  }
  console.log("Stopped periodic notifications");
}

function sendBackgroundNotification() {
  const notificationCount = (self.notificationCounter || 0) + 1;
  self.notificationCounter = notificationCount;

  const title = `Background Notification #${notificationCount}`;
  const options = {
    body: `Đây là thông báo background lần thứ ${notificationCount}`,
    icon: "/images/push_icon.jpg",
    badge: "/images/favicon.png",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Orange_tabby_cat_sitting_on_fallen_leaves-Hisashi-01A.jpg/1920px-Orange_tabby_cat_sitting_on_fallen_leaves-Hisashi-01A.jpg",
    data: {
      url: self.location.origin + "/?page=success",
      message_id: `bg_notification_${notificationCount}_${Date.now()}`,
    },
    tag: "auto-notification",
    requireInteraction: false,
    timestamp: Date.now(),
    actions: [
      {
        action: "view",
        title: "Xem chi tiết",
      },
      {
        action: "close",
        title: "Đóng",
      },
    ],
  };

  self.registration
    .showNotification(title, options)
    .then(() => {
      console.log(
        `Background notification ${notificationCount} sent at ${new Date().toLocaleTimeString()}`
      );
    })
    .catch((error) => {
      console.error("Error showing background notification:", error);
    });
}

// Keep service worker alive
self.addEventListener("install", function (event) {
  console.log("Service Worker installing...");
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  console.log("Service Worker activating...");
  event.waitUntil(self.clients.claim());
});

// Handle notification actions
self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  if (event.action === "close") {
    return;
  }

  const urlToOpen = event.notification.data?.url || "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then(function (clientList) {
        // Check if there's already a window/tab open with the target URL
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === urlToOpen && "focus" in client) {
            return client.focus();
          }
        }

        // If not, open a new window/tab
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});
