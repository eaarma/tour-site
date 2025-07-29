package com.example.store_manager.dto.shop;


import java.util.UUID;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShopUserDto {
    private UUID userId;
    private String userEmail;
    private String role;
    private String status;
}