
package com.example.store_manager.model;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "order_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "order_seq")
    @SequenceGenerator(name = "order_seq", sequenceName = "order_item_seq", allocationSize = 1, initialValue = 20000000)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    // Full relation to Tour (not just ID)
    @ManyToOne(optional = false)
    @JoinColumn(name = "tour_id", nullable = false)
    private Tour tour;

    // Denormalized fields for quick access + provider queries
    @Column(name = "shop_id", nullable = false)
    private Long shopId;

    @Column(name = "tour_title", nullable = false)
    private String tourTitle;

    @Column(name = "scheduled_at", nullable = false)
    @NotNull
    private LocalDateTime scheduledAt;

    @Column(name = "participants", nullable = false)
    @Min(1)
    private Integer participants;

    @Column(name = "tour_snapshot", columnDefinition = "text", nullable = false)
    private String tourSnapshot;

    // Contact info copied from order
    @Column(nullable = false)
    private String name;

    @Email
    @Column(nullable = false)
    private String email;

    @Pattern(regexp = "\\+?[0-9\\- ]{7,15}", message = "Invalid phone number")
    @Column(nullable = false)
    private String phone;

    @Column
    private String nationality;

    @Column(name = "price_paid", nullable = false, precision = 10, scale = 2)
    private BigDecimal pricePaid;

    @Column(name = "payment_method")
    private String paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;
}