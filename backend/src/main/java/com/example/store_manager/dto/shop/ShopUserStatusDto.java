package com.example.store_manager.dto.shop;

import java.time.LocalDateTime;
import lombok.*;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShopUserStatusDto {
    private Long shopId;
    private String shopName;
    private String role;
    private String status;
    private LocalDateTime joinedAt;
}