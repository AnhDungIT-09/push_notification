import React, { useState, useEffect, useRef } from "react";
import { apiThongBao } from "../apis/handleDataAPI";

const WebPushApp = () => {
  const [subscribeVisible, setSubscribeVisible] = useState(false);
  const [testSendVisible, setTestSendVisible] = useState(false);
  const [activeSubVisible, setActiveSubVisible] = useState(false);
  const [activeSubText, setActiveSubText] = useState("");
  const [addToHomeVisible, setAddToHomeVisible] = useState(false);
  const [content, setContent] = useState("");

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

    // Initialize service worker
    if ("serviceWorker" in navigator) {
      initServiceWorker();
    }
  }, []);

  const isPushManagerActive = (pushManager) => {
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
  };

  const initServiceWorker = async () => {
    try {
      // Sử dụng đường dẫn tương đối trong React
      let swRegistration = await navigator.serviceWorker.register(
        "/serviceworker.js",
        { scope: "/" }
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
          setSubscribeVisible(true);
          break;
        case "granted":
          displaySubscriptionInfo(await pushManager.getSubscription());
          break;
        case "denied":
          setSubscribeVisible(false);
          setActiveSubVisible(true);
          setActiveSubText("User denied push permission");
          break;
      }
    } catch (error) {
      console.error("Service Worker registration failed:", error);
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

  const testSend = (text) => {
    const title = "Đình Dũng thông báo nè";
    const options = {
      body: text,
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

  const [hasNotified, setHasNotified] = useState(false);
  const currentTitleRef = useRef(localStorage.getItem("notification_title"));

  useEffect(() => {
    const userDataString = localStorage.getItem("userData"); // Lấy chuỗi JSON từ localStorage

    let userDataObject = null; // Khởi tạo biến để lưu đối tượng

    if (userDataString) {
      try {
        userDataObject = JSON.parse(userDataString); // Chuyển đổi chuỗi JSON thành đối tượng JavaScript
      } catch (e) {
        console.error("Failed to parse userData from localStorage:", e);
        // Xử lý lỗi nếu chuỗi JSON không hợp lệ
        localStorage.removeItem("userData"); // Có thể xóa mục bị hỏng
      }
    }

    console.log(userDataObject);
    // Hàm được gọi lần đầu khi component mount
    const initializeTitle = async () => {
      // 1. Lấy title hiện tại từ server để khởi tạo localStorage
      const res = await apiThongBao({ action: "get_current_title" });
      console.log(res);
      if (res && res.data.success && res.data.title !== undefined) {
        if (
          currentTitleRef.current === null ||
          currentTitleRef.current !== res.data.title
        ) {
          localStorage.setItem("notification_title", res.data.title);
          currentTitleRef.current = res.data.title; // Cập nhật ref
          setHasNotified(false); // Reset trạng thái thông báo nếu title thay đổi khi khởi tạo
          // console.log("Đã khởi tạo/cập nhật title lần đầu:", res.data.title);
        } else {
          console.log(
            "Title lúc khởi tạo giống với localStorage:",
            res.data.title
          );
        }
      } else {
        console.error("Không thể lấy title ban đầu từ server.");
        // Có thể đặt một giá trị mặc định hoặc xử lý lỗi khác
      }
    };

    initializeTitle(); // Gọi hàm khởi tạo ngay lập tức

    // Thiết lập interval để kiểm tra thay đổi mỗi 1 giây
    const intervalId = setInterval(async () => {
      const storedTitle = currentTitleRef.current; // Lấy title từ ref (đã được cập nhật từ localStorage)

      if (storedTitle !== null) {
        // Chỉ kiểm tra nếu có title đã lưu
        const res = await apiThongBao({
          action: "check_title_change",
          title: storedTitle, // Gửi title đang lưu ở client để so sánh
        });
        console.log(res);
        if (res && res.data.success) {
          if (
            res.data.changed &&
            String(res.data.id_phong_ban) === String(userDataObject)
          ) {
            // Title trên server đã thay đổi
            if (!hasNotified) {
              // Chỉ thông báo nếu chưa thông báo cho lần thay đổi này
              testSend(res.data.current_db_title); // Hiển thị thông báo
              setHasNotified(true); // Đặt trạng thái đã thông báo
            }
            // Luôn cập nhật localStorage với title mới nhất từ server
            localStorage.setItem(
              "notification_title",
              res.data.current_db_title
            );
            currentTitleRef.current = res.data.current_db_title; // Cập nhật ref
            // console.log(
            //   "Title đã thay đổi, cập nhật localStorage:",
            //   res.data.current_db_title
            // );
          } else {
            // Title trên server không thay đổi
            if (hasNotified) {
              // Nếu trước đó đã thông báo, nhưng giờ title không thay đổi,
              // thì reset trạng thái thông báo để chuẩn bị cho lần thay đổi tiếp theo
              setHasNotified(false);
              // console.log("Title không thay đổi, reset trạng thái thông báo.");
            }
            // console.log("Title không thay đổi.");
          }
        } else {
          console.error(
            "Lỗi khi kiểm tra title:",
            res ? res.message : "Unknown error"
          );
        }
      } else {
        console.warn(
          "Không có title được lưu trong localStorage. Đang đợi khởi tạo."
        );
        // Nếu storedTitle là null (chưa khởi tạo), có thể thử gọi lại initializeTitle
        initializeTitle();
      }
    }, 1000); // Mỗi 1 giây

    // Hàm cleanup: Xóa interval khi component unmount
    return () => clearInterval(intervalId);
  }, [hasNotified]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#cfc7e2" }}>
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          WebPush iOS example {window.navigator.standalone}
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
              <p className="text-gray-700 break-words">
                {activeSubText || "Đã đăng ký thành công!"}
              </p>
            </div>
          )}

          {testSendVisible && (
            <button
              onClick={testSend}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg text-xl transition-colors duration-200"
            >
              Nhận thông báo
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WebPushApp;
