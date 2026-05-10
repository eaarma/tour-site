package com.tourhub.order.dto;

import com.tourhub.order.model.OrderStatus;
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
