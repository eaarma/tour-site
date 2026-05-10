package com.tourhub.shop.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShopDto {
    private Long id;
    private String name;
    private String shopName;
    private String description;
    private String createdAt;
    private String bankAccountName;
    private String bankAccountIban;
    private String status;
}
