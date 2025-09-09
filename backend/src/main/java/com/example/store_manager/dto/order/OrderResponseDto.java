package com.example.store_manager.dto.order;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import com.example.store_manager.dto.cart.CheckoutDetailsDto;
import com.example.store_manager.model.OrderStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderResponseDto {
    private UUID id;
    private Long tourId;

    private Integer participants;
    private Instant scheduledAt;
    private CheckoutDetailsDto checkoutDetails;
    private String paymentMethod;
    private BigDecimal pricePaid;
    private OrderStatus status;
    private Instant createdAt;
}
