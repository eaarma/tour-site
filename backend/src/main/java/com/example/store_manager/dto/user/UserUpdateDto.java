package com.example.store_manager.dto.user;

import lombok.Data;

@Data
public class UserUpdateDto {
    private String name;
    private String phone;
    private String nationality;
    private String bio;
    private String experience;
    private String languages;
    private String profileImageUrl;
}
