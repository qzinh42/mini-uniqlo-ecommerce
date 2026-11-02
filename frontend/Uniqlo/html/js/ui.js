// ui.js — chỉ lo việc render ra DOM, không chứa logic tính toán giỏ hàng

const STATUS_LABELS = {
  PENDING: "Chờ thanh toán",
  PAID: "Đã thanh toán",
  FAILED: "Thanh toán thất bại",
};
const PAY_METHODS = { COD: "COD", BANK: "Chuyển khoản", MOMO: "MoMo" };

// Đơn COD đang PENDING nghĩa là "trả tiền khi nhận hàng", không phải khách quên thanh toán
function getStatusInfo(order) {
  const status = order.paymentStatus || "PAID";
  if (order.paymentMethod === "COD" && status === "PENDING") {
    return { label: "Thanh toán khi nhận hàng", css: "COD" };
  }
  return { label: STATUS_LABELS[status] || status, css: status };
}

function formatVND(amount) {
  return amount.toLocaleString("vi-VN") + "₫";
}

async function updateCartBadge() {
  const cart = await loadCart();
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const badge = document.getElementById("cart-count");
  if (badge) badge.textContent = count;
}

// ===== Banner sản phẩm nổi bật (trang chủ) =====
async function renderHeroBanner() {
  const hero = document.getElementById("hero-banner");
  if (!hero) return;

  const products = await fetchProducts();
  if (products.length === 0) return;

  const featured = products.reduce((max, p) => (p.price > max.price ? p : max), products[0]);

  hero.href = `product.html?id=${featured.id}`;
  hero.style.backgroundImage = `url('${featured.image}')`;
  hero.innerHTML = `
    <div class="hero-content">
      <span class="hero-badge">HÀNG MỚI VỀ</span>
      <h2 class="hero-title">${featured.name}</h2>
      <p class="hero-desc">Khám phá ngay sản phẩm nổi bật tại Mini Uniqlo</p>
      <p class="hero-price">${formatVND(featured.price)}</p>
    </div>
  `;
}

// ===== Danh sách sản phẩm: lọc category + tìm kiếm =====
let currentCategory = "all";
let currentSearchTerm = "";

async function renderProductList() {
  const container = document.getElementById("product-list");
  if (!container) return;
  currentCategory = "all";
  currentSearchTerm = "";
  await renderFilteredProducts();
}

async function filterByCategory(category) {
  currentCategory = category;
  await renderFilteredProducts();
}

async function searchProducts() {
  const input = document.getElementById("search-input");
  currentSearchTerm = input.value.trim().toLowerCase();
  await renderFilteredProducts();
}

async function renderFilteredProducts() {
  const container = document.getElementById("product-list");
  if (!container) return;

  const products = await fetchProducts();
  const favoriteIds = await getFavoriteIds();

  let filtered = currentCategory === "all"
    ? products
    : products.filter((p) => p.category === currentCategory);

  if (currentSearchTerm) {
    filtered = filtered.filter((p) =>
      p.name.toLowerCase().includes(currentSearchTerm)
    );
  }

  if (filtered.length === 0) {
    container.innerHTML = `<p>Không tìm thấy sản phẩm phù hợp.</p>`;
    return;
  }

  container.innerHTML = filtered
    .map((p) => {
      const isLiked = favoriteIds.includes(p.id);
      return `
    <div class="product-card-wrapper">
      <button class="favorite-btn ${isLiked ? "liked" : ""}" onclick="handleFavoriteClick(event, ${p.id})">
        ${isLiked ? "♥" : "♡"}
      </button>
      <a class="product-card" href="product.html?id=${p.id}">
        <img src="${p.image}" alt="${p.name}">
        <h3>${p.name}</h3>
        <p>${formatVND(p.price)}</p>
      </a>
    </div>
  `;
    })
    .join("");
}

async function handleFavoriteClick(event, productId) {
  event.preventDefault();
  event.stopPropagation();

  const liked = await toggleFavorite(productId);
  event.target.textContent = liked ? "♥" : "♡";
  event.target.classList.toggle("liked", liked);
}

// ===== Chi tiết sản phẩm =====
async function renderProductDetail() {
  const container = document.getElementById("product-detail");
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const product = await getProductById(id);

  if (!product) {
    container.innerHTML = "<p>Không tìm thấy sản phẩm.</p>";
    return;
  }

  const favoriteIds = await getFavoriteIds();
  const isLiked = favoriteIds.includes(product.id);

  container.innerHTML = `
    <img src="${product.image}" alt="${product.name}">
    <h2>${product.name}</h2>
    <p class="price">${formatVND(product.price)}</p>
    <button onclick="addToCart(${product.id}); alert('Đã thêm vào giỏ hàng!')">
      Thêm vào giỏ hàng
    </button>
    <button class="favorite-btn-inline ${isLiked ? "liked" : ""}" onclick="handleFavoriteClick(event, ${product.id})">
      ${isLiked ? "♥ Đã thích" : "♡ Yêu thích"}
    </button>
  `;
}

// ===== Giỏ hàng =====
async function renderCartPage() {
  const container = document.getElementById("cart-items");
  const totalEl = document.getElementById("cart-total");
  if (!container) return;

  const cart = await loadCart();

  if (cart.length === 0) {
    container.innerHTML = "<p>Giỏ hàng của bạn đang trống.</p>";
    if (totalEl) totalEl.textContent = formatVND(0);
    return;
  }

  const products = await fetchProducts();

  container.innerHTML = cart
    .map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) return "";
      const subtotal = product.price * item.quantity;
      return `
      <div class="cart-row">
        <span>${product.name}</span>
        <input
          type="number"
          min="1"
          value="${item.quantity}"
          onchange="updateQuantity(${item.id}, parseInt(this.value))"
        >
        <span>${formatVND(subtotal)}</span>
        <button onclick="removeFromCart(${item.id})">Xóa</button>
      </div>
    `;
    })
    .join("");

  const total = await calculateTotal();
  if (totalEl) totalEl.textContent = formatVND(total);
}

// ===== Đơn hàng (có nhãn trạng thái thanh toán) =====
async function renderOrdersPage() {
  const container = document.getElementById("orders-list");
  if (!container) return;

  const res = await fetch(`${ORDER_API}?cartId=${getCartId()}`);
  const orders = await res.json();

  if (orders.length === 0) {
    container.innerHTML = "<p>Bạn chưa có đơn hàng nào.</p>";
    return;
  }

  const productsMap = await fetchProducts();

  const blocks = await Promise.all(
    orders.map(async (order) => {
      const itemsRes = await fetch(`${ORDER_API}/${order.id}/items`);
      const items = await itemsRes.json();

      const itemsHtml = items
        .map((item) => {
          const product = productsMap.find((p) => p.id === item.productId);
          const name = product ? product.name : `Sản phẩm #${item.productId}`;
          return `<li>${name} × ${item.quantity} — ${formatVND(item.priceAtOrder * item.quantity)}</li>`;
        })
        .join("");

      const createdDate = new Date(order.createdAt).toLocaleString("vi-VN");
      const method = PAY_METHODS[order.paymentMethod] || order.paymentMethod || "COD";
      const info = getStatusInfo(order);

      return `
        <div class="order-card">
          <h3>Đơn hàng #${order.id}</h3>
          <span class="status-badge status-${info.css}">${info.label}</span>
          <p class="order-date">${createdDate} · ${method}</p>
          <ul>${itemsHtml}</ul>
          <p class="order-total">Tổng: ${formatVND(order.totalAmount)}</p>
        </div>
      `;
    })
  );

  container.innerHTML = blocks.join("");
}

// ===== Sản phẩm yêu thích =====
async function renderFavoritesPage() {
  const container = document.getElementById("product-list");
  if (!container) return;

  const user = getCurrentUser();
  if (!user) {
    container.innerHTML = `<p>Vui lòng <a href="login.html">đăng nhập</a> để xem sản phẩm yêu thích.</p>`;
    return;
  }

  const products = await fetchProducts();
  const favoriteIds = await getFavoriteIds();
  const favoriteProducts = products.filter((p) => favoriteIds.includes(p.id));

  if (favoriteProducts.length === 0) {
    container.innerHTML = "<p>Bạn chưa thích sản phẩm nào.</p>";
    return;
  }

  container.innerHTML = favoriteProducts
    .map(
      (p) => `
    <div class="product-card-wrapper">
      <button class="favorite-btn liked" onclick="handleFavoriteClick(event, ${p.id})">♥</button>
      <a class="product-card" href="product.html?id=${p.id}">
        <img src="${p.image}" alt="${p.name}">
        <h3>${p.name}</h3>
        <p>${formatVND(p.price)}</p>
      </a>
    </div>
  `
    )
    .join("");
}

// Badge giỏ hàng cần cập nhật ở MỌI trang
document.addEventListener("DOMContentLoaded", updateCartBadge);