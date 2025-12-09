package com.example.store_manager.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
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
import com.example.store_manager.security.annotations.AccessLevel;
import com.example.store_manager.security.annotations.ShopAccess;

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
                                .role(ShopUserRole.OWNER)
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

        @ShopAccess(AccessLevel.OWNER)
        public ShopDto updateShop(Long shopId, ShopCreateRequestDto dto) {

                Shop shop = shopRepository.findById(shopId)
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