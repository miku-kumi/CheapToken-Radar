import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

// 全域錯誤記錄：未捕捉例外／Promise 拒絕一律寫入 console，
// 配合錯誤邊界畫面回報，可精確定位殘留的執行期問題。
window.addEventListener("error", (e) => {
  console.error("[window.error]", e.error ?? e.message);
});
window.addEventListener("unhandledrejection", (e) => {
  console.error("[unhandledrejection]", e.reason);
});

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
