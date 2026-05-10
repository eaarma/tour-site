package com.tourhub.shop.mapper;

import org.springframework.stereotype.Component;

import com.tourhub.shop.dto.PublicShopUserDto;
import com.tourhub.shop.dto.ShopUserDto;
import com.tourhub.shop.dto.ShopUserStatusDto;
import com.tourhub.shop.model.ShopUser;
import com.tourhub.user.model.User;

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

    public PublicShopUserDto toPublicDto(ShopUser shopUser) {
        User user = shopUser.getUser();

        return PublicShopUserDto.builder()
                .userName(user.getName())
                .role(shopUser.getRole().name())
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
