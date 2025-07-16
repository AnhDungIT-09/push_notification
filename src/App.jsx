// src/App.jsx
import React, { useState, useEffect, useCallback } from "react";

const VAPID_PUBLIC_KEY =
  "BAwUJxIa7mJZMqu78Tfy2Sb1BWnYiAatFCe1cxpnM-hxNtXjAwaNKz1QKLU8IYYhjUASOFzSvSnMgC00vfsU0IM";

function App() {
  const [showSubscribeBtn, setShowSubscribeBtn] = useState(false);
  const [activeSubscriptionMessage, setActiveSubscriptionMessage] =
    useState("");
  const [showTestSendBtn, setShowTestSendBtn] = useState(false);
  const [showAddToHomeScreen, setShowAddToHomeScreen] = useState(false);
  const [contentMessage, setContentMessage] = useState("");

  const isPushManagerActive = useCallback((pushManager) => {
    if (!pushManager) {
      if (!window.navigator.standalone) {
        setShowAddToHomeScreen(true);
      } else {
        console.error("PushManager is not active");
      }
      setShowSubscribeBtn(false);
      return false;
    } else {
      return true;
    }
  }, []);

  const displaySubscriptionInfo = useCallback((subscription) => {
    setShowSubscribeBtn(false);
    // setActiveSubscriptionMessage(
    //   "<b>Active subscription:</b><br><br>" +
    //     JSON.stringify(subscription.toJSON())
    // );
    setShowTestSendBtn(true);
  }, []);

  const initServiceWorker = useCallback(async () => {
    try {
      let swRegistration = await navigator.serviceWorker.register(
        "/serviceworker.js" // Đường dẫn tương đối đến public
        // { scope: "/push/" } // Đảm bảo scope khớp với cấu hình máy chủ của bạn
      );
      let pushManager = swRegistration.pushManager;

      if (!isPushManagerActive(pushManager)) {
        return;
      }

      let permissionState = await pushManager.permissionState({
        userVisibleOnly: true,
      });

      switch (permissionState) {
        case "prompt":
          setShowSubscribeBtn(true);
          break;
        case "granted":
          displaySubscriptionInfo(await pushManager.getSubscription());
          break;
        case "denied":
          setShowSubscribeBtn(false);
          setActiveSubscriptionMessage("User denied push permission");
          break;
        default:
          break;
      }
    } catch (error) {
      console.error("Error initializing service worker:", error);
    }
  }, [isPushManagerActive, displaySubscriptionInfo]);

  const subscribeToPush = async () => {
    let swRegistration = await navigator.serviceWorker.getRegistration();
    let pushManager = swRegistration.pushManager;
    if (!isPushManagerActive(pushManager)) {
      return;
    }
    let subscriptionOptions = {
      userVisibleOnly: true,
      applicationServerKey: VAPID_PUBLIC_KEY,
    };
    try {
      let subscription = await pushManager.subscribe(subscriptionOptions);
      displaySubscriptionInfo(subscription);
      // Here you can send fetch request with subscription data to your backend API for next push sends from there
    } catch (error) {
      setActiveSubscriptionMessage("User denied push permission");
    }
  };

  const testSend = async () => {
    const title = "Đình Dũng thông báo";
    const options = {
      body: "Đây là thông báo từ Đình Dũng",
      icon: "/images/push_icon.jpg", // Đường dẫn tương đối đến public
      image:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Orange_tabby_cat_sitting_on_fallen_leaves-Hisashi-01A.jpg/1920px-Orange_tabby_cat_sitting_on_fallen_leaves-Hisashi-01A.jpg",
      data: {
        url: "https://anhdungit-09.github.io/push/?page=success", // Giữ nguyên URL gốc hoặc điều chỉnh nếu cần
        message_id: "your_internal_unique_message_id_for_tracking",
      },
    };
    navigator.serviceWorker.ready.then(async function (serviceWorker) {
      await serviceWorker.showNotification(title, options);
    });
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("page") === "success") {
      setContentMessage(
        "Đình Dũng cảm ơn bạn đã đăng ký nhận thông báo từ Đình Dũng. Bạn có thể đóng trang này."
      );
    }

    if (navigator.serviceWorker) {
      initServiceWorker();
    }
  }, [initServiceWorker]);

  return (
    <div className="wrapper">
      <h1>WebPush iOS example</h1>

      <div id="content">
        {contentMessage ? (
          <p>{contentMessage}</p>
        ) : (
          <>
            {showAddToHomeScreen && (
              <div id="add-to-home-screen">
                Nếu là IPhone, bạn hãy thêm trang này vào màn hình chính của
                điện thoại bằng cách nhấn vào nút <strong>Chia sẻ</strong> ở
                dưới cùng của trình duyệt Safari và chọn{" "}
                <strong>Thêm vào Màn hình chính</strong>.
              </div>
            )}

            {showSubscribeBtn && (
              <button id="subscribe_btn" onClick={subscribeToPush}>
                Đăng ký nhận thông báo
              </button>
            )}

            {activeSubscriptionMessage && (
              <div
                id="active_sub"
                dangerouslySetInnerHTML={{ __html: activeSubscriptionMessage }}
              ></div>
            )}

            {showTestSendBtn && (
              <button id="test_send_btn" onClick={testSend}>
                Nhận thông báo
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
