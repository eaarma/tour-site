package com.example.store_manager.model;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

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
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

 @ManyToOne(optional = true)
@JoinColumn(name = "user_id", nullable = true)
private User user;

    @ManyToOne(optional = false)
    @JoinColumn(name = "tour_id", nullable = false)
    @NotNull
    private Tour tour;

    @Column(name = "scheduled_at", nullable = false)
    @NotNull
    private LocalDateTime scheduledAt;

    @Column(name = "participants", nullable = false)
    @Min(1)
    private Integer participants;

    
    @Column(name = "tour_snapshot", columnDefinition = "text", nullable = false)
    private String tourSnapshot;

    @Column(nullable = false)
    @NotBlank
    private String name;

    @Email
    @Column(nullable = false)
    private String email;

    @Pattern(regexp = "\\+?[0-9\\- ]{7,15}", message = "Invalid phone number")
    @Column(nullable = false)
    private String phone;

    @Column
    private String nationality; // Optional

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @NotNull
    private OrderStatus status;

    @Column(name = "price_paid", nullable = false, precision = 10, scale = 2)
    @DecimalMin(value = "0.0", inclusive = false)
    @Digits(integer = 10, fraction = 2)
    private BigDecimal pricePaid;

    @Column(name = "payment_method")
    private String paymentMethod; // Optional: CARD, PAYPAL, etc.

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;
}