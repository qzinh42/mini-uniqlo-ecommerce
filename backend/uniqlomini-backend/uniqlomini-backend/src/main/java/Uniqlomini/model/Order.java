package Uniqlomini.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
@Getter
@Setter
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "cart_id")
    private String cartId;

    @Column(name = "total_amount")
    private Integer totalAmount;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}