package com.example.store_manager.dto.shop;

import java.time.Instant;
import java.time.LocalDateTime;
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
    private Instant joinedAt;
}
