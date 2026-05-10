package com.tourhub.shop.dto;

import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShopUserDto {
    private UUID userId;
    private String userEmail;
    private String userName;
    private String phone;
    private String role;
    private String status;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private String joinedAt;
}
