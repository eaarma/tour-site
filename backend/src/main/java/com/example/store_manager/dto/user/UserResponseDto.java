package com.example.store_manager.dto.user;

import java.util.UUID;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponseDto {
    private UUID id;
    private String name;
    private String email;
    private String role;
}