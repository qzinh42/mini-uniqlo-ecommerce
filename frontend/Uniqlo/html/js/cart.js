// cart.js — giờ mọi thao tác đều gọi API, không tự tính toán ở phía trình duyệt nữa

const CART_API = "http://localhost:8081/api/cart";
const ORDER_API = "http://localhost:8081/api/orders";
const FAVORITE_API = "http://localhost:8081/api/favorites";

async function addToCart(productId, quantity = 1) {
  await fetch(`${CART_API}/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cartId: getCartId(), productId, quantity }),
  });
  updateCartBadge();
}

async function loadCart() {
  const res = await fetch(`${CART_API}?cartId=${getCartId()}`);
  return res.json();
}

async function removeFromCart(cartItemId) {
  await fetch(`${CART_API}/items/${cartItemId}`, { method: "DELETE" });
  renderCartPage();
  updateCartBadge();
}

async function updateQuantity(cartItemId, quantity) {
  if (isNaN(quantity) || quantity < 1) {
    alert("Số lượng phải là số nguyên dương (tối thiểu là 1).");
    renderCartPage();
    return;
  }

  await fetch(`${CART_API}/items/${cartItemId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quantity }),
  });
  renderCartPage();
  updateCartBadge();
}

async function calculateTotal() {
  const cart = await loadCart();
  const products = await fetchProducts();
  return cart.reduce((total, item) => {
    const product = products.find((p) => p.id === item.productId);
    return product ? total + product.price * item.quantity : total;
  }, 0);
}

async function checkout() {
  const confirmed = confirm("Xác nhận đặt hàng?");
  if (!confirmed) return;

  try {
    const res = await fetch(
      `${ORDER_API}/checkout?cartId=${getCartId()}`,
      { method: "POST" }
    );

    if (!res.ok) {
      alert("Đặt hàng thất bại, vui lòng thử lại.");
      return;
    }

    const order = await res.json();
    alert(`Đặt hàng thành công! Mã đơn hàng: #${order.id}`);
    window.location.href = "index.html";
  } catch (err) {
    alert("Không kết nối được server, vui lòng kiểm tra lại.");
    console.error(err);
  }
}

async function getFavoriteIds() {
  const user = getCurrentUser();
  if (!user) return [];

  const res = await fetch(`${FAVORITE_API}?userId=${user.id}`);
  const favorites = await res.json();
  return favorites.map((f) => f.productId);
}

async function toggleFavorite(productId) {
  const user = getCurrentUser();
  if (!user) {
    alert("Vui lòng đăng nhập để dùng chức năng yêu thích.");
    window.location.href = "login.html";
    return;
  }

  const res = await fetch(`${FAVORITE_API}/toggle`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: user.id, productId }),
  });

  const result = await res.json();
  return result.liked;
}