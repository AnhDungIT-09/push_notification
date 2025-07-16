import React from "react";
import WebPushExample from "./WebPushExample";

function App() {
  return (
    <div class="wrapper">
      <h1>WebPush iOS example</h1>

      <div id="content">
        <div id="add-to-home-screen">
          Nếu là IPhone, bạn hãy thêm trang này vào màn hình chính của điện
          thoại bằng cách nhấn vào nút <strong>Chia sẻ</strong> ở dưới cùng của
          trình duyệt Safari và chọn <strong>Thêm vào Màn hình chính</strong>.
        </div>

        <button id="subscribe_btn" onclick="subscribeToPush()">
          Đăng ký nhận thông báo
        </button>

        <div id="active_sub"></div>
        <button id="test_send_btn" onclick="testSend()">
          Nhận thông báo
        </button>
      </div>
    </div>
  );
}

export default App;
