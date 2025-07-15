import React, { useState, useEffect } from "react";

// Public part of VAPID key
const VAPID_PUBLIC_KEY =
  "BAwUJxIa7mJZMqu78Tfy2Sb1BWnYiAatFCe1cxpnM-hxNtXjAwaNKz1QKLU8IYYhjUASOFzSvSnMgC00vfsU0IM";

// Styles will be inlined for simplicity, or you could use a CSS module/file
const styles = {
  body: {
    backgroundColor: "#cfc7e2",
    fontFamily: "Arial, sans-serif",
    fontSize: "18px",
    paddingBottom: "50px",
  },
  wrapper: {
    maxWidth: "800px",
    margin: "0 auto",
  },
  addToHomeScreen: {
    display: "none", // Managed by state
    backgroundColor: "bisque",
    padding: "10px",
  },
  addToHomeScreenImg: {
    display: "block",
    margin: "0 auto",
    paddingTop: "10px",
    maxHeight: "500px",
    maxWidth: "100%",
  },
  scanQrCodeImg: {
    display: "block",
    maxWidth: "100%",
  },
  subscribeBtn: {
    display: "none", // Managed by state
    width: "100%",
    lineHeight: "2",
    fontSize: "20px",
    marginTop: "10px",
  },
  testSendBtn: {
    display: "none", // Managed by state
    width: "100%",
    lineHeight: "2",
    fontSize: "20px",
    marginTop: "10px",
  },
  activeSub: {
    display: "none", // Managed by state
    backgroundColor: "#e7e7ff",
    padding: "20px",
    wordWrap: "break-word",
  },
  sourceLink: {
    position: "fixed",
    bottom: "10px",
    color: "#fff",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: "5px",
    left: "10px",
  },
};

function WebPushExample() {
  const [showSubscribeButton, setShowSubscribeButton] = useState(false);
  const [showTestSendButton, setShowTestSendButton] = useState(false);
  const [activeSubscriptionInfo, setActiveSubscriptionInfo] = useState("");
  const [showAddToHomeScreen, setShowAddToHomeScreen] = useState(false);
  const [contentMessage, setContentMessage] = useState("");

  // Service Worker registration reference
  const [swRegistration, setSwRegistration] = useState(null);

  // Helper to check PushManager activity
  const isPushManagerActive = (pushManager) => {
    if (!pushManager) {
      if (!window.navigator.standalone) {
        setShowAddToHomeScreen(true);
      } else {
        console.error("PushManager is not active"); // Log error instead of throwing to avoid crashing the component
      }
      setShowSubscribeButton(false);
      return false;
    }
    return true;
  };

  // Function to display subscription info
  const displaySubscriptionInfo = (subscription) => {
    setShowSubscribeButton(false);
    setActiveSubscriptionInfo(
      `<b>Active subscription:</b><br><br>${JSON.stringify(
        subscription.toJSON()
      )}`
    );
    setShowTestSendButton(true);
  };

  // Initialize Service Worker and check push permission
  useEffect(() => {
    const initServiceWorker = async () => {
      if ("serviceWorker" in navigator) {
        let registration;
        try {
          registration = await navigator.serviceWorker.register(
            "https://anhdungit-09.github.io/push/serviceworker.js",
            { scope: "/push/" }
          );
          setSwRegistration(registration);

          let pushManager = registration.pushManager;

          if (!isPushManagerActive(pushManager)) {
            return;
          }

          let permissionState = await pushManager.permissionState({
            userVisibleOnly: true,
          });

          switch (permissionState) {
            case "prompt":
              setShowSubscribeButton(true);
              break;
            case "granted":
              displaySubscriptionInfo(await pushManager.getSubscription());
              break;
            case "denied":
              setShowSubscribeButton(false);
              setActiveSubscriptionInfo("User denied push permission");
              break;
            default:
              break;
          }
        } catch (error) {
          console.error("Service Worker registration failed:", error);
        }
      } else {
        console.warn("Service Workers are not supported in this browser.");
      }
    };

    initServiceWorker();

    // Handle URL parameter for success message
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("page") === "success") {
      setContentMessage(
        "You successfully opened page from WebPush! (this url was that was set in json data param)"
      );
    }
  }, []); // Empty dependency array means this effect runs once after the initial render

  // Subscribe to push notifications
  const subscribeToPush = async () => {
    if (!swRegistration) {
      console.error("Service Worker not registered.");
      return;
    }

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
      console.error("Error subscribing to push:", error);
      setActiveSubscriptionInfo("User denied push permission");
    }
  };

  // Send test push notification
  const testSend = async () => {
    const title = "Push title";
    const options = {
      body: "Additional text with some description",
      icon: "https://andreinwald.github.io/webpush-ios-example/images/push_icon.jpg",
      image:
        "https://upload.wikimedia.wikimedia.org/wikipedia/commons/thumb/6/68/Orange_tabby_cat_sitting_on_fallen_leaves-Hisashi-01A.jpg/1920px-Orange_tabby_cat_sitting_on_fallen_leaves-Hisashi-01A.jpg",
      data: {
        url: "https://andreinwald.github.io/webpush-ios-example/?page=success",
        message_id: "your_internal_unique_message_id_for_tracking",
      },
    };

    if (swRegistration) {
      try {
        await swRegistration.showNotification(title, options);
      } catch (error) {
        console.error("Error showing notification:", error);
      }
    } else {
      console.error("Service Worker not ready to show notification.");
    }
  };

  return (
    <div style={styles.body}>
      <div className="wrapper" style={styles.wrapper}>
        <h1>WebPush iOS example</h1>

        <div id="content">
          {contentMessage && <p>{contentMessage}</p>}{" "}
          {/* Display content message if set */}
          {showAddToHomeScreen && (
            <div id="add-to-home-screen" style={styles.addToHomeScreen}>
              For WebPush work you may need to add this website to Home Screen
              at your iPhone or iPad (window.navigator is not standalone).
              <img
                src="images/webpush-add-to-home-screen.jpg"
                alt="webpush add to some screen"
                style={styles.addToHomeScreenImg}
              />
            </div>
          )}
          {/* QR Code section, assuming you still want it directly in the HTML */}
          <div
            id="scan-qr-code"
            style={
              window.supportsTouchCallout === false ? { display: "none" } : {}
            }
          >
            {" "}
            {/* Equivalent to @supports (-webkit-touch-callout: none) */}
            Open this page at your iPhone/iPad:
            <img
              src="images/qrcode.png"
              alt="qrCode"
              style={styles.scanQrCodeImg}
            />
            <br />
            <br />
          </div>
          {showSubscribeButton && (
            <button
              id="subscribe_btn"
              onClick={subscribeToPush}
              style={styles.subscribeBtn}
            >
              Subscribe to notifications
            </button>
          )}
          {activeSubscriptionInfo && (
            <div
              id="active_sub"
              style={styles.activeSub}
              dangerouslySetInnerHTML={{ __html: activeSubscriptionInfo }}
            ></div>
          )}
          {showTestSendButton && (
            <button
              id="test_send_btn"
              onClick={testSend}
              style={styles.testSendBtn}
            >
              Send test push
            </button>
          )}
        </div>

        <a
          id="source_link"
          href="https://github.com/andreinwald/webpush-ios-example"
          style={styles.sourceLink}
        >
          Code of this page
        </a>
      </div>
    </div>
  );
}

export default WebPushExample;
