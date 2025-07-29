package com.example.store_manager.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "shop_users", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"shop_id", "user_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShopUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "shop_id", nullable = false)
    private Shop shop;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ShopUserRole role;  // e.g., ADMIN, MANAGER, GUIDE

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ShopUserStatus status; // e.g., ACTIVE, PENDING, REJECTED

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}