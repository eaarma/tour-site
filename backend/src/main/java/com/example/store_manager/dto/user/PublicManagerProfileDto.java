package com.example.store_manager.dto.user;

import java.time.Instant;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PublicManagerProfileDto {
    private UUID id;
    private String name;
    private String nationality;
    private String bio;
    private String experience;
    private String languages;
    private Instant createdAt;
    private String profileImageUrl;
}
