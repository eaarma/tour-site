package com.example.store_manager.dto.shop;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShopDto {
    private Long id;
    private String name;
    private String description;
    private String createdAt; // ISO string
    private String shopName; // Optional, for cases where we want to include it in responses

}