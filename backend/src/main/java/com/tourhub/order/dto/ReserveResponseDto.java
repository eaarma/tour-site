package com.tourhub.order.dto;

import java.time.Instant;
import com.tourhub.order.model.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ReserveResponseDto {

    private Long orderId;
    private Instant expiresAt;
    private OrderStatus status;
    private String reservationToken;
}
