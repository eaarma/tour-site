package com.example.store_manager.dto.reserve;

import java.time.Instant;
import com.example.store_manager.model.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ReserveResponseDto {

    private Long orderId;
    private Instant expiresAt;
    private OrderStatus status;
}
