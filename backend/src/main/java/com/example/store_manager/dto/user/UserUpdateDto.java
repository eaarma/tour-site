package com.example.store_manager.dto.user;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Builder;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserUpdateDto {
    private String name;
    private String phone;
    private String nationality;
    private String bio;
    private String experience;
    private String languages;
    private String profileImageUrl;
}
