package com.tourhub.shop.dto;

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
    private String joinedAt;
}
