const CHAT_API = "http://localhost:8081/api/chat";

function toggleChatBox() {
  const box = document.getElementById("chat-box");
  const isOpen = box.style.display === "flex";
  box.style.display = isOpen ? "none" : "flex";
  if (!isOpen) loadChatMessages();
}

async function loadChatMessages() {
  const user = getCurrentUser();
  const messagesEl = document.getElementById("chat-messages");

  if (!user) {
    messagesEl.innerHTML = `<p class="chat-login-note">Vui lòng <a href="login.html">đăng nhập</a> để chat với chúng tôi.</p>`;
    return;
  }

  const res = await fetch(`${CHAT_API}?userId=${user.id}`);
  const messages = await res.json();
  renderChatMessages(messages);
}

function renderChatMessages(messages) {
  const messagesEl = document.getElementById("chat-messages");

  if (messages.length === 0) {
    messagesEl.innerHTML = `<p class="chat-login-note">Gửi tin nhắn đầu tiên cho chúng tôi!</p>`;
    return;
  }

  messagesEl.innerHTML = messages
    .map(
      (m) => `<div class="chat-msg chat-msg-${m.sender}">${m.content}</div>`
    )
    .join("");

  messagesEl.scrollTop = messagesEl.scrollHeight; // tự cuộn xuống tin nhắn mới nhất
}

async function sendChatMessage(event) {
  event.preventDefault();

  const user = getCurrentUser();
  if (!user) return;

  const input = document.getElementById("chat-input");
  const content = input.value.trim();
  if (!content) return;

  input.value = "";

  const res = await fetch(CHAT_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: user.id, content }),
  });

  const messages = await res.json();
  renderChatMessages(messages);
}