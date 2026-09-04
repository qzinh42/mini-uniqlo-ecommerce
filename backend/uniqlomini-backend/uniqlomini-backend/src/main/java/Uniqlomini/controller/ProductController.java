package Uniqlomini.controller;

import Uniqlomini.model.Product;
import Uniqlomini.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    @GetMapping
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    @GetMapping("/{id}")
    public Product getProductById(@PathVariable Long id) {
        return productRepository.findById(id).orElse(null);
    }
    @PostMapping
public Product createProduct(@RequestBody Product product) {
    return productRepository.save(product);
}

@PutMapping("/{id}")
public Product updateProduct(@PathVariable Long id, @RequestBody Product updated) {
    Product product = productRepository.findById(id).orElseThrow();
    product.setName(updated.getName());
    product.setPrice(updated.getPrice());
    product.setCategory(updated.getCategory());
    product.setImage(updated.getImage());
    return productRepository.save(product);
}

@DeleteMapping("/{id}")
public void deleteProduct(@PathVariable Long id) {
    productRepository.deleteById(id);
}
}