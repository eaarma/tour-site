package com.example.store_manager.dto.order;

import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;

import com.example.store_manager.model.OrderStatus;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemResponseDto {
    private Long id;
    private Long tourId;
    private Long shopId;
    private String tourTitle;
    private LocalDateTime scheduledAt;
    private Integer participants;

    // Contact details
    private String name;
    private String email;
    private String phone;
    private String nationality;

    private BigDecimal pricePaid;
    private OrderStatus status;
    private Instant createdAt;

    private String tourSnapshot; // optional in response, but nice to expose
}