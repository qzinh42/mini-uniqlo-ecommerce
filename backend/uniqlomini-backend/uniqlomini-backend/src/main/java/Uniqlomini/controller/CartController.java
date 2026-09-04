package Uniqlomini.controller;

import Uniqlomini.model.CartItem;
import Uniqlomini.repository.CartItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "*")
public class CartController {

    @Autowired
    private CartItemRepository cartItemRepository;

    @GetMapping
    public List<CartItem> getCart(@RequestParam String cartId) {
        return cartItemRepository.findByCartId(cartId);
    }

    @PostMapping("/items")
    public CartItem addItem(@RequestBody CartItem newItem) {
        var existing = cartItemRepository
                .findByCartIdAndProductId(newItem.getCartId(), newItem.getProductId());

        if (existing.isPresent()) {
            CartItem item = existing.get();
            item.setQuantity(item.getQuantity() + newItem.getQuantity());
            return cartItemRepository.save(item);
        }
        return cartItemRepository.save(newItem);
    }

    @PutMapping("/items/{id}")
    public CartItem updateQuantity(@PathVariable Long id, @RequestBody CartItem update) {
        CartItem item = cartItemRepository.findById(id).orElseThrow();
        item.setQuantity(update.getQuantity());
        return cartItemRepository.save(item);
    }

    @DeleteMapping("/items/{id}")
    public void removeItem(@PathVariable Long id) {
        cartItemRepository.deleteById(id);
    }
}