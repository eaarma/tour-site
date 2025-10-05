package com.example.store_manager.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import com.example.store_manager.dto.shop.ShopCreateRequestDto;
import com.example.store_manager.dto.shop.ShopDto;
import com.example.store_manager.mapper.ShopMapper;
import com.example.store_manager.model.Shop;
import com.example.store_manager.model.ShopUser;
import com.example.store_manager.model.ShopUserRole;
import com.example.store_manager.model.ShopUserStatus;
import com.example.store_manager.model.User;
import com.example.store_manager.repository.ShopRepository;
import com.example.store_manager.repository.ShopUserRepository;
import com.example.store_manager.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ShopService {

    private final ShopRepository shopRepository;
    private final ShopMapper shopMapper;
    private final ShopUserService shopUserService;
    private final ShopUserRepository shopUserRepository;
    private final UserRepository userRepository;

    public ShopDto createShop(ShopCreateRequestDto dto, UUID currentUserId) {
        Shop shop = Shop.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .build();
        Shop saved = shopRepository.save(shop);

        // Automatically add current user as MANAGER with ACTIVE status
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ShopUser shopUser = ShopUser.builder()
                .shop(saved)
                .user(user)
                .role(ShopUserRole.MANAGER)
                .status(ShopUserStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .build();

        shopUserRepository.save(shopUser);

        return shopMapper.toDto(saved);
    }

    public ShopDto getShop(Long id) {
        Shop shop = shopRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Shop not found"));
        return shopMapper.toDto(shop);
    }

    public ShopDto updateShop(Long id, ShopCreateRequestDto dto, UUID currentUserId) {
        if (!shopUserService.hasShopRole(id, currentUserId, ShopUserRole.MANAGER)) {
            throw new RuntimeException("Only managers can update the shop");
        }

        Shop shop = shopRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Shop not found"));

        shopMapper.updateShopFromDto(dto, shop);
        return shopMapper.toDto(shopRepository.save(shop));
    }

    public List<ShopDto> getAllShops() {
        return shopRepository.findAll().stream()
                .map(shopMapper::toDto)
                .collect(Collectors.toList());
    }
}