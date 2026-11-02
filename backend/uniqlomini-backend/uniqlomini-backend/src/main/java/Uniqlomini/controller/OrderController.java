package Uniqlomini.controller;

import Uniqlomini.model.*;
import Uniqlomini.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;


@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    @Autowired private CartItemRepository cartItemRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private OrderRepository orderRepository;
    @Autowired private OrderItemRepository orderItemRepository;

    @PostMapping("/checkout")
public Order checkout(@RequestParam String cartId,
                      @RequestParam(defaultValue = "COD") String method) {
    List<CartItem> cartItems = cartItemRepository.findByCartId(cartId);

    if (cartItems.isEmpty()) {
        throw new RuntimeException("Giỏ hàng đang trống, không thể đặt hàng.");
    }

    // Tính tổng tiền dựa trên giá sản phẩm hiện tại
    int total = 0;
    for (CartItem item : cartItems) {
        Product product = productRepository.findById(item.getProductId()).orElseThrow();
        total += product.getPrice() * item.getQuantity();
    }

    // Tạo đơn hàng
    Order order = new Order();
    order.setCartId(cartId);
    order.setTotalAmount(total);
    order.setCreatedAt(LocalDateTime.now());
    order.setPaymentMethod(method);
    order.setPaymentStatus("PENDING"); // chờ thanh toán
    order = orderRepository.save(order);

    // Sao chép từng dòng giỏ hàng thành order_items
    for (CartItem item : cartItems) {
        Product product = productRepository.findById(item.getProductId()).orElseThrow();
        OrderItem orderItem = new OrderItem();
        orderItem.setOrderId(order.getId());
        orderItem.setProductId(item.getProductId());
        orderItem.setQuantity(item.getQuantity());
        orderItem.setPriceAtOrder(product.getPrice());
        orderItemRepository.save(orderItem);
    }

    // Xóa sạch giỏ hàng sau khi đặt hàng thành công
    cartItemRepository.deleteAll(cartItems);

    return order;
}
    @GetMapping
public List<Order> getOrdersByCart(@RequestParam String cartId) {
    return orderRepository.findByCartId(cartId);
}

@GetMapping("/{orderId}/items")
public List<OrderItem> getOrderItems(@PathVariable Long orderId) {
    return orderItemRepository.findByOrderId(orderId);
}
@GetMapping("/{orderId}")
public Order getOrder(@PathVariable Long orderId) {
    return orderRepository.findById(orderId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng."));
}

// Cổng thanh toán GIẢ: thật ra đây là chỗ cổng thật sẽ gọi callback về
@PostMapping("/{orderId}/pay")
public Order simulatePayment(@PathVariable Long orderId, @RequestParam boolean success) {
    Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng."));

    if (!"PENDING".equals(order.getPaymentStatus())) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Đơn hàng này đã được xử lý thanh toán.");
    }

    order.setPaymentStatus(success ? "PAID" : "FAILED");
    return orderRepository.save(order);
}
}