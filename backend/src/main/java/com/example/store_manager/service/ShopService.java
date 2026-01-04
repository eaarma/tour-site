package com.example.store_manager.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
import com.example.store_manager.utility.ApiError;
import com.example.store_manager.utility.Result;
import com.example.store_manager.security.annotations.ShopIdSource;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ShopService {

        private final ShopRepository shopRepository;
        private final ShopMapper shopMapper;
        private final ShopUserService shopUserService;
        private final ShopUserRepository shopUserRepository;
        private final UserRepository userRepository;

        @Transactional
        public Result<ShopDto> createShop(ShopCreateRequestDto dto, UUID currentUserId) {

                // 1️⃣ Create and save shop
                Shop shop = Shop.builder()
                                .name(dto.getName())
                                .description(dto.getDescription())
                                .build();

                Shop savedShop = shopRepository.save(shop);

                // 2️⃣ Load current user
                User user = userRepository.findById(currentUserId)
                                .orElse(null);

                if (user == null) {
                        return Result.fail(ApiError.notFound("User not found"));
                }

                // 3️⃣ Create OWNER ShopUser
                ShopUser shopUser = ShopUser.builder()
                                .shop(savedShop)
                                .user(user)
                                .role(ShopUserRole.OWNER)
                                .status(ShopUserStatus.ACTIVE)
                                .createdAt(LocalDateTime.now())
                                .build();

                shopUserRepository.save(shopUser);

                // 4️⃣ Return DTO
                return Result.ok(shopMapper.toDto(savedShop));
        }

        @Transactional(readOnly = true)
        public Result<ShopDto> getShop(Long id) {

                return shopRepository.findById(id)
                                .map(shopMapper::toDto)
                                .map(Result::ok)
                                .orElseGet(() -> Result.fail(ApiError.notFound("Shop not found")));
        }

        @Transactional
        @ShopAccess(value = AccessLevel.OWNER, source = ShopIdSource.SHOP_ID)
        public Result<ShopDto> updateShop(Long shopId, ShopCreateRequestDto dto) {

                Shop shop = shopRepository.findById(shopId)
                                .orElse(null);

                if (shop == null) {
                        return Result.fail(ApiError.notFound("Shop not found"));
                }

                shopMapper.updateShopFromDto(dto, shop);
                Shop saved = shopRepository.save(shop);

                return Result.ok(shopMapper.toDto(saved));
        }

        @Transactional(readOnly = true)
        public Result<List<ShopDto>> getAllShops() {

                List<ShopDto> shops = shopRepository.findAll().stream()
                                .map(shopMapper::toDto)
                                .toList();

                return Result.ok(shops);
        }
}
