// serviceworker.js
self.addEventListener("push", (event) => {
  // Cấu trúc khóa PushData chuẩn https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/showNotification
  let pushData = event.data.json();
  if (!pushData || !pushData.title) {
    console.error(
      "Đã nhận WebPush với tiêu đề trống. Nội dung đã nhận: ",
      pushData
    );
  }
  self.registration.showNotification(pushData.title, pushData).then(() => {
    // Bạn có thể lưu vào phân tích của mình sự kiện thông báo đã được hiển thị
    // fetch('https://your_backend_server.com/track_show?message_id=' + pushData.data.message_id);
  });
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  if (!event.notification.data) {
    console.error(
      "Nhấp vào WebPush với dữ liệu trống, nơi đáng lẽ phải có URL. Thông báo: ",
      event.notification
    );
    return;
  }
  if (!event.notification.data.url) {
    console.error(
      "Nhấp vào WebPush không có URL. Thông báo: ",
      event.notification
    );
    return;
  }

  clients.openWindow(event.notification.data.url).then(() => {
    // Bạn có thể gửi yêu cầu fetch tới API phân tích của mình sự kiện thông báo đã được nhấp
    // fetch('https://your_backend_server.com/track_click?message_id=' + pushData.data.message_id);
  });
});
