package com.example.store_manager.dto.shop;

import lombok.*;
import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShopUserStatusDto {
    private Long shopId;
    private String shopName;
    private String role;
    private String status;
    private Instant joinedAt;
}