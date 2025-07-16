import React, { useState, useEffect } from "react";

const WebPushApp = () => {
  const [subscribeVisible, setSubscribeVisible] = useState(false);
  const [testSendVisible, setTestSendVisible] = useState(false);
  const [activeSubVisible, setActiveSubVisible] = useState(false);
  const [activeSubText, setActiveSubText] = useState("");
  const [addToHomeVisible, setAddToHomeVisible] = useState(false);
  const [content, setContent] = useState("");
  const [isAutoSending, setIsAutoSending] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  const VAPID_PUBLIC_KEY =
    "BAwUJxIa7mJZMqu78Tfy2Sb1BWnYiAatFCe1cxpnM-hxNtXjAwaNKz1QKLU8IYYhjUASOFzSvSnMgC00vfsU0IM";

  useEffect(() => {
    // Check if we're on success page
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("page") === "success") {
      setContent(
        "Đình Dũng cảm ơn bạn đã đăng ký nhận thông báo từ Đình Dũng. Bạn có thể đóng trang này."
      );
    }

    // Request background sync permissions
    requestBackgroundPermissions();

    // Initialize service worker
    if ("serviceWorker" in navigator) {
      initServiceWorker();
    }

    // Cleanup interval on component unmount
    return () => {
      if (window.notificationInterval) {
        clearInterval(window.notificationInterval);
      }
    };
  }, []);

  const requestBackgroundPermissions = async () => {
    try {
      // Request notification permission
      if ("Notification" in window) {
        const permission = await Notification.requestPermission();
        console.log("Notification permission:", permission);
      }

      // Request wake lock permission to keep app active
      if ("wakeLock" in navigator) {
        try {
          const wakeLock = await navigator.wakeLock.request("screen");
          console.log("Wake lock acquired:", wakeLock);
        } catch (err) {
          console.log("Wake lock not supported or denied:", err);
        }
      }

      // Request background sync if available
      if (
        "serviceWorker" in navigator &&
        "sync" in window.ServiceWorkerRegistration.prototype
      ) {
        console.log("Background sync is supported");
      }
    } catch (error) {
      console.error("Error requesting background permissions:", error);
    }
  };

  const isPushManagerActive = (pushManager) => {
    console.log(window.navigator.standalone);
    if (!pushManager) {
      if (!window.navigator.standalone) {
        setAddToHomeVisible(true);
      } else {
        throw new Error("PushManager is not active");
      }
      setSubscribeVisible(false);
      return false;
    } else {
      return true;
    }
  };

  const displaySubscriptionInfo = (subscription) => {
    setSubscribeVisible(false);
    setActiveSubVisible(true);
    setTestSendVisible(true);

    // Bắt đầu gửi thông báo tự động mỗi 5 giây
    startAutoNotifications();
  };

  const startAutoNotifications = () => {
    setIsAutoSending(true);
    setActiveSubText(
      "Đã đăng ký thành công! Đang gửi thông báo tự động mỗi 5 giây..."
    );

    // Clear existing interval if any
    if (window.notificationInterval) {
      clearInterval(window.notificationInterval);
    }

    // Send message to service worker to start background notifications
    navigator.serviceWorker.ready.then((registration) => {
      registration.active.postMessage({
        type: "START_AUTO_NOTIFICATIONS",
      });
    });

    // Start sending notifications every 5 seconds from main thread as backup
    window.notificationInterval = setInterval(() => {
      sendAutoNotification();
    }, 5000);

    // Send first notification immediately
    sendAutoNotification();
  };

  const stopAutoNotifications = () => {
    setIsAutoSending(false);

    // Stop main thread interval
    if (window.notificationInterval) {
      clearInterval(window.notificationInterval);
      window.notificationInterval = null;
    }

    // Send message to service worker to stop background notifications
    navigator.serviceWorker.ready.then((registration) => {
      registration.active.postMessage({
        type: "STOP_AUTO_NOTIFICATIONS",
      });
    });

    setActiveSubText("Đã dừng gửi thông báo tự động");
  };

  const sendAutoNotification = () => {
    const newCount = notificationCount + 1;
    setNotificationCount(newCount);

    const title = `Đình Dũng thông báo #${newCount}`;
    const options = {
      body: `Đây là thông báo tự động lần thứ ${newCount} từ Đình Dũng`,
      icon: "/images/push_icon.jpg",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Orange_tabby_cat_sitting_on_fallen_leaves-Hisashi-01A.jpg/1920px-Orange_tabby_cat_sitting_on_fallen_leaves-Hisashi-01A.jpg",
      data: {
        url: window.location.origin + "/?page=success",
        message_id: `auto_notification_${newCount}_${Date.now()}`,
      },
      tag: "auto-notification", // Prevents notification spam
      requireInteraction: false,
      timestamp: Date.now(),
    };

    navigator.serviceWorker.ready.then(async function (serviceWorker) {
      await serviceWorker.showNotification(title, options);
      console.log(
        `Auto notification ${newCount} sent at ${new Date().toLocaleTimeString()}`
      );
    });
  };

  const initServiceWorker = async () => {
    try {
      console.log("Initializing service worker...");

      // Kiểm tra HTTPS
      if (location.protocol !== "https:" && location.hostname !== "localhost") {
        console.error("Push notifications require HTTPS");
        setActiveSubVisible(true);
        setActiveSubText("Push notifications require HTTPS");
        return;
      }

      // Sử dụng đường dẫn tương đối trong React
      let swRegistration = await navigator.serviceWorker.register(
        "/serviceworker.js",
        { scope: "/" }
      );
      console.log("Service worker registered:", swRegistration);

      let pushManager = swRegistration.pushManager;

      if (!isPushManagerActive(pushManager)) {
        return;
      }

      let permissionState = await pushManager.permissionState({
        userVisibleOnly: true,
      });

      console.log("Permission state:", permissionState);

      switch (permissionState) {
        case "prompt":
          setSubscribeVisible(true);
          break;
        case "granted":
          const subscription = await pushManager.getSubscription();
          console.log("Existing subscription:", subscription);
          displaySubscriptionInfo(subscription);
          break;
        case "denied":
          setSubscribeVisible(false);
          setActiveSubVisible(true);
          setActiveSubText("User denied push permission");
          break;
      }
    } catch (error) {
      console.error("Service Worker registration failed:", error);
      setActiveSubVisible(true);
      setActiveSubText(`Service Worker error: ${error.message}`);
    }
  };

  const subscribeToPush = async () => {
    try {
      let swRegistration = await navigator.serviceWorker.getRegistration();
      let pushManager = swRegistration.pushManager;

      if (!isPushManagerActive(pushManager)) {
        return;
      }

      let subscriptionOptions = {
        userVisibleOnly: true,
        applicationServerKey: VAPID_PUBLIC_KEY,
      };

      let subscription = await pushManager.subscribe(subscriptionOptions);
      displaySubscriptionInfo(subscription);
      // Here you can send fetch request with subscription data to your backend API for next push sends from there
    } catch (error) {
      setActiveSubVisible(true);
      setActiveSubText("User denied push permission");
    }
  };

  const testSend = () => {
    const title = "Đình Dũng thông báo";
    const options = {
      body: "Đây là thông báo từ Đình Dũng",
      icon: "/images/push_icon.jpg",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Orange_tabby_cat_sitting_on_fallen_leaves-Hisashi-01A.jpg/1920px-Orange_tabby_cat_sitting_on_fallen_leaves-Hisashi-01A.jpg",
      data: {
        url: window.location.origin + "/?page=success",
        message_id: "your_internal_unique_message_id_for_tracking",
      },
    };

    navigator.serviceWorker.ready.then(async function (serviceWorker) {
      await serviceWorker.showNotification(title, options);
    });
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#cfc7e2" }}>
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          WebPush iOS example
        </h1>

        <div className="space-y-4">
          {content && (
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <p className="text-lg text-gray-700">{content}</p>
            </div>
          )}

          {addToHomeVisible && (
            <div className="bg-yellow-100 p-4 rounded-lg border border-yellow-300">
              <p className="text-gray-700">
                Nếu là IPhone, bạn hãy thêm trang này vào màn hình chính của
                điện thoại bằng cách nhấn vào nút <strong>Chia sẻ</strong> ở
                dưới cùng của trình duyệt Safari và chọn{" "}
                <strong>Thêm vào Màn hình chính</strong>.
              </p>
            </div>
          )}

          {subscribeVisible && (
            <button
              onClick={subscribeToPush}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg text-xl transition-colors duration-200"
            >
              Đăng ký nhận thông báo
            </button>
          )}

          {activeSubVisible && (
            <div className="bg-blue-50 p-5 rounded-lg border border-blue-200">
              <p className="text-gray-700 break-words mb-3">
                {activeSubText || "Đã đăng ký thành công!"}
              </p>
              {isAutoSending && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-600">
                    Đã gửi {notificationCount} thông báo
                  </span>
                  <button
                    onClick={stopAutoNotifications}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm transition-colors duration-200"
                  >
                    Dừng gửi tự động
                  </button>
                </div>
              )}
            </div>
          )}

          {testSendVisible && !isAutoSending && (
            <div className="space-y-3">
              <button
                onClick={testSend}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg text-xl transition-colors duration-200"
              >
                Gửi thông báo thử nghiệm
              </button>
              <button
                onClick={startAutoNotifications}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg text-xl transition-colors duration-200"
              >
                Bắt đầu gửi tự động (mỗi 5 giây)
              </button>
            </div>
          )}
        </div>

        <div className="fixed bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-2 rounded">
          <a href="#" className="text-white hover:text-gray-300">
            Source Link
          </a>
        </div>
      </div>
    </div>
  );
};

export default WebPushApp;
