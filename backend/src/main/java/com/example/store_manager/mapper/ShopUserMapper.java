package com.example.store_manager.mapper;

import com.example.store_manager.dto.shop.ShopUserDto;
import com.example.store_manager.dto.shop.ShopUserStatusDto;
import com.example.store_manager.model.ShopUser;

import org.springframework.stereotype.Component;

@Component
public class ShopUserMapper {

    public ShopUserDto toDto(ShopUser shopUser) {
        return ShopUserDto.builder()
                .userId(shopUser.getUser().getId())
                .userEmail(shopUser.getUser().getEmail())
                .role(shopUser.getRole().name())
                .status(shopUser.getStatus().name())
                .build();
    }

    public ShopUserStatusDto toStatusDto(ShopUser shopUser) {
        return ShopUserStatusDto.builder()
                .shopId(shopUser.getShop().getId())
                .shopName(shopUser.getShop().getName())
                .role(shopUser.getRole().name())
                .status(shopUser.getStatus().name())
                .joinedAt(shopUser.getCreatedAt())
                .build();
    }
}