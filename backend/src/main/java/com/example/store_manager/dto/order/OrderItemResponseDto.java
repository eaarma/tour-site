package com.example.store_manager.dto.order;

import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import com.example.store_manager.model.OrderStatus;
import com.example.store_manager.model.TourImage;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemResponseDto {
    private Long id;
    private Long tourId;
    private Long shopId;
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

    private Long sessionId;

    private UUID managerId;
    private String managerName;
    private String tourSnapshot; // optional in response, but nice to expose
    private String preferredLanguage;
    private String comment;
    private String tourTitle;
    private String tourLocation;
    private String tourMeetingPoint;
    private List<String> tourImages;
}