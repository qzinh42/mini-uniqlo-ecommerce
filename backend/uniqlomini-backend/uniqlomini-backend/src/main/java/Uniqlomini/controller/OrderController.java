package Uniqlomini.controller;

import Uniqlomini.model.*;
import Uniqlomini.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    @Autowired private CartItemRepository cartItemRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private OrderRepository orderRepository;
    @Autowired private OrderItemRepository orderItemRepository;

    @PostMapping("/checkout")
    public Order checkout(@RequestParam String cartId) {
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
}