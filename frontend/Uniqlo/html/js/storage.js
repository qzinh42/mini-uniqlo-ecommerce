function getCartId() {
  const user = getCurrentUser(); // nếu đã đăng nhập, dùng userId cố định thay vì UUID ngẫu nhiên
  if (user) {
    return `user-${user.id}`;
  }

  let cartId = localStorage.getItem("cartId");
  if (!cartId) {
    cartId = crypto.randomUUID();
    localStorage.setItem("cartId", cartId);
  }
  return cartId;
}