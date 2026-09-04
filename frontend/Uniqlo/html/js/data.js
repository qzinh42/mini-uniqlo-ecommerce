// data.js — chịu trách nhiệm DUY NHẤT: lấy dữ liệu sản phẩm từ Spring Boot API

const API_BASE_URL = "http://localhost:8081/api";

let cachedProducts = null; // cache để không fetch lại nhiều lần trong 1 trang

async function fetchProducts() {
  if (cachedProducts) return cachedProducts;
  try {
    const res = await fetch(`${API_BASE_URL}/products`);
    if (!res.ok) throw new Error(`Server trả về lỗi: ${res.status}`);
    cachedProducts = await res.json();
    return cachedProducts;
  } catch (err) {
    console.error("Không kết nối được backend:", err);
    document.body.innerHTML = `
      <div style="padding:40px;text-align:center;font-family:sans-serif">
        <h2>Không kết nối được server</h2>
        <p>Vui lòng kiểm tra Spring Boot đã chạy chưa (http://localhost:8081).</p>
      </div>
    `;
    throw err;
  }
}

async function getProductById(id) {
  const res = await fetch(`${API_BASE_URL}/products/${id}`);
  if (!res.ok) return null;
  return res.json();
}