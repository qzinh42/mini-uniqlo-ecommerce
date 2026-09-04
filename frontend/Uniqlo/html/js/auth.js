const AUTH_API = "http://localhost:8081/api/auth";

async function registerUser(event) {
  event.preventDefault();
  const username = document.getElementById("reg-username").value.trim();
  const password = document.getElementById("reg-password").value;

  if (!username || !password) {
    alert("Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.");
    return;
  }

  const res = await fetch(`${AUTH_API}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    const msg = await res.text();
    alert("Đăng ký thất bại: " + msg);
    return;
  }

  alert("Đăng ký thành công! Vui lòng đăng nhập.");
  window.location.href = "login.html";
}

async function loginUser(event) {
  event.preventDefault();
  const username = document.getElementById("login-username").value.trim();
  const password = document.getElementById("login-password").value;

  const res = await fetch(`${AUTH_API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    alert("Sai tên đăng nhập hoặc mật khẩu.");
    return;
  }

  const user = await res.json();
  localStorage.setItem("currentUser", JSON.stringify(user));
  window.location.href = "index.html";
}

function getCurrentUser() {
  const data = localStorage.getItem("currentUser");
  return data ? JSON.parse(data) : null;
}

function logout() {
  localStorage.removeItem("currentUser");
  window.location.href = "index.html";
}

function requireAdmin() {
  const user = getCurrentUser();
  const isAdmin = user && user.role === "admin";

  const deniedEl = document.getElementById("access-denied");
  const contentEl = document.getElementById("admin-content");

  if (!isAdmin) {
    if (deniedEl) deniedEl.style.display = "block";
    if (contentEl) contentEl.style.display = "none";
    return false;
  }

  if (deniedEl) deniedEl.style.display = "none";
  if (contentEl) contentEl.style.display = "block";
  return true;
}

// Hiện "Xin chào, X | Đăng xuất" hoặc "Đăng nhập | Đăng ký" tùy trạng thái
function renderAuthStatus() {
  const el = document.getElementById("auth-status");
  if (!el) return;

  const user = getCurrentUser();

  if (!user) {
    el.innerHTML = `<a href="login.html">Đăng nhập</a> | <a href="register.html">Đăng ký</a>`;
    return;
  }

  const adminLink = user.role === "admin"
    ? ` | <a href="admin.html">Quản trị</a>`
    : "";

  el.innerHTML = `Xin chào, ${user.username}${adminLink} | <a href="#" onclick="logout()">Đăng xuất</a>`;
}

document.addEventListener("DOMContentLoaded", renderAuthStatus);