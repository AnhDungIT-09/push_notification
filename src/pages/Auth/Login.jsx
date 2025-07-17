import React, { useState } from "react";

const Login = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailCopied, setEmailCopied] = useState(false); // State để hiển thị thông báo copy email
  const [passwordCopied, setPasswordCopied] = useState(false); // State để hiển thị thông báo copy password

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Giả lập API call (thay thế bằng API thực tế của bạn)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Giả lập kiểm tra đăng nhập
      if (
        formData.email === "admin@example.com" &&
        formData.password === "password"
      ) {
        // Tạo token và thông tin user giả lập
        const token = "fake-jwt-token-" + Date.now();
        const userData = {
          id: 1,
          name: "Admin User",
          email: formData.email,
          role: "admin",
        };

        // Gọi callback để thông báo đăng nhập thành công
        onLoginSuccess(userData, token);
      } else {
        setError("Email hoặc mật khẩu không chính xác");
      }
    } catch (err) {
      setError("Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Hàm copy text vào clipboard
  const copyToClipboard = (text, type) => {
    // Tạo một textarea tạm thời
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand("copy"); // Sử dụng document.execCommand('copy')
      if (type === "email") {
        setEmailCopied(true);
        setTimeout(() => setEmailCopied(false), 2000); // Hiển thị "Copied!" trong 2 giây
      } else if (type === "password") {
        setPasswordCopied(true);
        setTimeout(() => setPasswordCopied(false), 2000); // Hiển thị "Copied!" trong 2 giây
      }
    } catch (err) {
      console.error("Không thể copy: ", err);
      alert("Không thể copy vào clipboard. Vui lòng thử lại."); // Fallback alert nếu copy thất bại
    } finally {
      document.body.removeChild(textarea); // Xóa textarea tạm thời
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
          <svg
            className="w-5 h-5 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-red-700">{error}</span>
        </div>
      )}

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          value={formData.email}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
          placeholder="Nhập email của bạn"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Mật khẩu
        </label>
        <input
          type="password"
          id="password"
          name="password"
          required
          value={formData.password}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
          placeholder="Nhập mật khẩu của bạn"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center space-x-2"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Đang đăng nhập...</span>
          </>
        ) : (
          <>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span>Đăng nhập</span>
          </>
        )}
      </button>

      {/* Thông tin tài khoản demo */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-2">
          Tài khoản demo:
        </h3>
        <p className="text-sm text-blue-700 flex items-center justify-between">
          <span>
            <strong>Email:</strong> admin@example.com
          </span>
          <button
            type="button"
            onClick={() => copyToClipboard("admin@example.com", "email")}
            className="ml-2 p-1 rounded-md hover:bg-blue-100 transition duration-200 relative"
            title="Copy email"
          >
            <svg
              className="w-4 h-4 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
              />
            </svg>
            {emailCopied && (
              <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap">
                Đã copy!
              </span>
            )}
          </button>
        </p>
        <p className="text-sm text-blue-700 flex items-center justify-between mt-2">
          <span>
            <strong>Mật khẩu:</strong> password
          </span>
          <button
            type="button"
            onClick={() => copyToClipboard("password", "password")}
            className="ml-2 p-1 rounded-md hover:bg-blue-100 transition duration-200 relative"
            title="Copy mật khẩu"
          >
            <svg
              className="w-4 h-4 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
              />
            </svg>
            {passwordCopied && (
              <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap">
                Đã copy!
              </span>
            )}
          </button>
        </p>
      </div>
    </form>
  );
};

export default Login;
