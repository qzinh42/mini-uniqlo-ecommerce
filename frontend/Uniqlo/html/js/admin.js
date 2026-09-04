// admin.js — quản lý sản phẩm (thêm/sửa/xóa), chỉ dùng riêng ở trang admin.html

let editingProductId = null; // null = đang thêm mới; có giá trị = đang sửa sản phẩm đó

async function renderAdminProductList() {
  const container = document.getElementById("admin-product-list");
  if (!container) return;

  cachedProducts = null; // xóa cache để luôn thấy dữ liệu mới nhất sau khi sửa/xóa
  const products = await fetchProducts();

  container.innerHTML = products
    .map(
      (p) => `
    <div class="admin-row">
      <img src="${p.image}" alt="${p.name}" width="60">
      <span>${p.name}</span>
      <span>${formatVND(p.price)}</span>
      <span>${p.category}</span>
      <button onclick="startEdit(${p.id})">Sửa</button>
      <button onclick="deleteProduct(${p.id})">Xóa</button>
    </div>
  `
    )
    .join("");
}

async function startEdit(id) {
  const product = await getProductById(id);
  if (!product) return;

  editingProductId = id;
  document.getElementById("form-title").textContent = `Sửa sản phẩm #${id}`;
  document.getElementById("product-name").value = product.name;
  document.getElementById("product-price").value = product.price;
  document.getElementById("product-category").value = product.category;
  document.getElementById("product-image").value = product.image;
  document.getElementById("submit-btn").textContent = "Cập nhật";
}

function resetForm() {
  editingProductId = null;
  document.getElementById("form-title").textContent = "Thêm sản phẩm mới";
  document.getElementById("product-name").value = "";
  document.getElementById("product-price").value = "";
  document.getElementById("product-category").value = "";
  document.getElementById("product-image").value = "";
  document.getElementById("submit-btn").textContent = "Thêm sản phẩm";
}

async function submitProductForm(event) {
  event.preventDefault();

  const name = document.getElementById("product-name").value.trim();
  const priceRaw = document.getElementById("product-price").value;
  const category = document.getElementById("product-category").value.trim();
  const image = document.getElementById("product-image").value.trim();
  const price = parseInt(priceRaw);

  // Kiểm tra từng điều kiện, báo lỗi rõ ràng thay vì gộp chung 1 câu
  if (!name) {
    alert("Vui lòng nhập tên sản phẩm.");
    return;
  }
  if (!priceRaw || isNaN(price) || price <= 0) {
    alert("Giá sản phẩm phải là số nguyên dương lớn hơn 0.");
    return;
  }
  if (!category) {
    alert("Vui lòng nhập category cho sản phẩm.");
    return;
  }

  const productData = { name, price, category, image };

  const url = editingProductId
    ? `${API_BASE_URL}/products/${editingProductId}`
    : `${API_BASE_URL}/products`;
  const method = editingProductId ? "PUT" : "POST";

  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(productData),
  });

  if (!res.ok) {
    alert("Lưu sản phẩm thất bại.");
    return;
  }

  resetForm();
  await renderAdminProductList();
}

async function deleteProduct(id) {
  const confirmed = confirm("Xóa sản phẩm này? Hành động không thể hoàn tác.");
  if (!confirmed) return;

  const res = await fetch(`${API_BASE_URL}/products/${id}`, { method: "DELETE" });
  if (!res.ok) {
    alert("Xóa thất bại.");
    return;
  }
  await renderAdminProductList();
}