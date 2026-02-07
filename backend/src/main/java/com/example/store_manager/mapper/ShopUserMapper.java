package com.example.store_manager.mapper;

import com.example.store_manager.dto.shop.ShopUserDto;
import com.example.store_manager.dto.shop.ShopUserStatusDto;
import com.example.store_manager.model.ShopUser;

import org.springframework.stereotype.Component;

import com.example.store_manager.model.User;

@Component
public class ShopUserMapper {

    public ShopUserDto toDto(ShopUser shopUser) {
        User user = shopUser.getUser();

        return ShopUserDto.builder()
                .userId(user.getId())
                .userEmail(user.getEmail())
                .userName(user.getName())
                .phone(user.getPhone())
                .role(shopUser.getRole().name())
                .status(shopUser.getStatus().name())
                .joinedAt(shopUser.getCreatedAt().toString())
                .build();
    }

    public ShopUserStatusDto toStatusDto(ShopUser shopUser) {
        return ShopUserStatusDto.builder()
                .shopId(shopUser.getShop().getId())
                .shopName(shopUser.getShop().getName())
                .role(shopUser.getRole().name())
                .status(shopUser.getStatus().name())
                .joinedAt(shopUser.getCreatedAt().toString())
                .build();
    }
}