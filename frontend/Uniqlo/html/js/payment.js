// payment.js — trang thanh toán GIẢ LẬP: dựng đúng luồng của cổng thanh toán thật
// (tạo đơn PENDING → sang trang thanh toán → nhận kết quả → cập nhật trạng thái)

const METHOD_LABELS = {
  BANK: "Chuyển khoản ngân hàng",
  MOMO: "Ví MoMo",
  COD: "Thanh toán khi nhận hàng",
};
// Ảnh QR theo phương thức. Chỉ có 1 ảnh thì để cùng một tên file cho cả hai
const QR_IMAGES = {
  BANK: "images/RRpayment.jpg",
  MOMO: "images/RRpayment.jpg",
};

async function loadPaymentPage() {
  const container = document.getElementById("payment-box");
  const orderId = new URLSearchParams(window.location.search).get("orderId");

  if (!orderId) {
    container.innerHTML = "<p>Thiếu mã đơn hàng.</p>";
    return;
  }

  const res = await fetch(`${ORDER_API}/${orderId}`);
  if (!res.ok) {
    container.innerHTML = "<p>Không tìm thấy đơn hàng.</p>";
    return;
  }

  const order = await res.json();

  if (order.paymentStatus !== "PENDING") {
    showPaymentResult(container, order);
    return;
  }

  const qrSrc = QR_IMAGES[order.paymentMethod] || QR_IMAGES.BANK;

  container.innerHTML = `
    <h2>Thanh toán đơn hàng #${order.id}</h2>
    <p>Phương thức: <strong>${METHOD_LABELS[order.paymentMethod] || order.paymentMethod}</strong></p>
    <p>Số tiền: <strong class="pay-amount">${formatVND(order.totalAmount)}</strong></p>
    <img class="qr-img" src="${qrSrc}" alt="Mã QR thanh toán">
    <p class="pay-note">Đây là trang thanh toán giả lập, không phát sinh giao dịch thật.</p>
    <div class="pay-actions">
      <button onclick="confirmPayment(${order.id}, true)">Thanh toán thành công</button>
      <button class="btn-outline" onclick="confirmPayment(${order.id}, false)">Giả lập thất bại / Hủy</button>
    </div>
  `;
}

async function confirmPayment(orderId, success) {
  const res = await fetch(`${ORDER_API}/${orderId}/pay?success=${success}`, { method: "POST" });
  if (!res.ok) {
    alert("Không xử lý được thanh toán.");
    return;
  }
  const order = await res.json();
  showPaymentResult(document.getElementById("payment-box"), order);
}

function showPaymentResult(container, order) {
  const paid = order.paymentStatus === "PAID";
  container.innerHTML = `
    <h2>${paid ? "✅ Thanh toán thành công" : "❌ Thanh toán không thành công"}</h2>
    <p>Đơn hàng #${order.id} — ${formatVND(order.totalAmount)}</p>
    <a href="orders.html">Xem đơn hàng của tôi</a>
  `;
}