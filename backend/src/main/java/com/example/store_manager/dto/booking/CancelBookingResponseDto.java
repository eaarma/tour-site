package com.example.store_manager.dto.booking;

import com.example.store_manager.model.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class CancelBookingResponseDto {
    private Long orderId;
    private Long itemId;
    private boolean refundable;
    private BigDecimal refundAmount;
    private OrderStatus newStatus;
}