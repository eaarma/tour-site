package com.example.store_manager.dto.user;

import java.time.LocalDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponseDto {
    private UUID id;
    private String name;
    private String email;
    private String role;

    private String phone;
    private String nationality;
    private String bio;
    private String experience;
    private String languages;
    private LocalDateTime createdAt;
    private String profileImageUrl;
}
