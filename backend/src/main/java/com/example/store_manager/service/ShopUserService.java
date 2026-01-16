package com.example.store_manager.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.store_manager.dto.shop.ShopMembershipStatusDto;
import com.example.store_manager.dto.shop.ShopUserDto;
import com.example.store_manager.dto.shop.ShopUserStatusDto;
import com.example.store_manager.mapper.ShopUserMapper;
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
import com.example.store_manager.security.annotations.ShopIdSource;
import com.example.store_manager.utility.ApiError;
import com.example.store_manager.utility.Result;
import com.example.store_manager.security.annotations.ShopIdSource;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ShopUserService {

        private final ShopUserRepository shopUserRepository;
        private final UserRepository userRepository;
        private final ShopRepository shopRepository;
        private final ShopUserMapper shopUserMapper;

        @Transactional(readOnly = true)
        public Result<List<ShopUserDto>> getUsersByShopId(Long shopId) {
                List<ShopUserDto> users = shopUserRepository.findByShopId(shopId)
                                .stream()
                                .map(shopUserMapper::toDto)
                                .toList();

                return Result.ok(users);
        }

        @Transactional(readOnly = true)
        public Result<List<ShopUserDto>> getActiveMembersForShop(Long shopId) {
                List<ShopUserDto> users = shopUserRepository.findByShopIdAndStatus(shopId, ShopUserStatus.ACTIVE)
                                .stream()
                                .map(shopUserMapper::toDto)
                                .toList();

                return Result.ok(users);
        }

        @Transactional(readOnly = true)
        public Result<List<ShopUserStatusDto>> getShopsForUser(UUID userId) {
                List<ShopUserStatusDto> shops = shopUserRepository.findByUserId(userId)
                                .stream()
                                .map(shopUserMapper::toStatusDto)
                                .toList();

                return Result.ok(shops);
        }

        @Transactional
        @ShopAccess(value = AccessLevel.MANAGER, source = ShopIdSource.SHOP_ID)
        public Result<Boolean> addUserToShop(Long shopId, UUID userIdToAdd, String role) {

                Shop shop = shopRepository.findById(shopId).orElse(null);
                if (shop == null) {
                        return Result.fail(ApiError.notFound("Shop not found"));
                }

                User user = userRepository.findById(userIdToAdd).orElse(null);
                if (user == null) {
                        return Result.fail(ApiError.notFound("User not found"));
                }

                ShopUserRole shopUserRole;
                try {
                        shopUserRole = ShopUserRole.valueOf(role.toUpperCase());
                } catch (IllegalArgumentException ex) {
                        return Result.fail(ApiError.badRequest("Invalid role"));
                }

                ShopUser shopUser = ShopUser.builder()
                                .shop(shop)
                                .user(user)
                                .role(shopUserRole)
                                .status(ShopUserStatus.PENDING)
                                .build();

                shopUserRepository.save(shopUser);
                return Result.ok(true);
        }

        @Transactional
        @ShopAccess(value = AccessLevel.MANAGER, source = ShopIdSource.SHOP_ID)
        public Result<Boolean> updateUserStatus(Long shopId, UUID userId, String status) {

                ShopUser shopUser = shopUserRepository.findByShopIdAndUserId(shopId, userId).orElse(null);

                if (shopUser == null) {
                        return Result.fail(ApiError.notFound("Shop user not found"));
                }

                try {
                        shopUser.setStatus(ShopUserStatus.valueOf(status.toUpperCase()));
                } catch (IllegalArgumentException ex) {
                        return Result.fail(ApiError.badRequest("Invalid status"));
                }

                shopUserRepository.save(shopUser);
                return Result.ok(true);
        }

        @Transactional
        @ShopAccess(value = AccessLevel.MANAGER, source = ShopIdSource.SHOP_ID)
        public Result<Boolean> updateUserRole(Long shopId, UUID userId, String role) {

                ShopUser shopUser = shopUserRepository.findByShopIdAndUserId(shopId, userId).orElse(null);

                if (shopUser == null) {
                        return Result.fail(ApiError.notFound("Shop user not found"));
                }

                try {
                        shopUser.setRole(ShopUserRole.valueOf(role.toUpperCase()));
                } catch (IllegalArgumentException ex) {
                        return Result.fail(ApiError.badRequest("Invalid role"));
                }

                shopUserRepository.save(shopUser);
                return Result.ok(true);
        }

        @Transactional
        public Result<Boolean> requestJoinShop(Long shopId, UUID userId) {

                Shop shop = shopRepository.findById(shopId).orElse(null);
                if (shop == null) {
                        return Result.fail(ApiError.notFound("Shop not found"));
                }

                User user = userRepository.findById(userId).orElse(null);
                if (user == null) {
                        return Result.fail(ApiError.notFound("User not found"));
                }

                if (shopUserRepository.findByShopIdAndUserId(shopId, userId).isPresent()) {
                        return Result.fail(ApiError.badRequest(
                                        "Already requested or a member of this shop"));
                }

                ShopUser shopUser = ShopUser.builder()
                                .shop(shop)
                                .user(user)
                                .role(ShopUserRole.GUIDE)
                                .status(ShopUserStatus.PENDING)
                                .createdAt(LocalDateTime.now())
                                .build();

                shopUserRepository.save(shopUser);
                return Result.ok(true);
        }

        @Transactional(readOnly = true)
        public Result<ShopMembershipStatusDto> getMembership(Long shopId, UUID userId) {

                return shopUserRepository.findByShopIdAndUserId(shopId, userId)
                                .map(shopUser -> Result.ok(
                                                ShopMembershipStatusDto.builder()
                                                                .member(true)
                                                                .role(shopUser.getRole())
                                                                .status(shopUser.getStatus())
                                                                .build()))
                                .orElseGet(() -> Result.fail(ApiError.notFound("Not a member")));
        }

        public boolean isMemberOfShop(Long shopId, UUID userId) {
                return shopUserRepository.existsByUserIdAndShopId(userId, shopId);
        }

        public boolean hasShopRole(Long shopId, UUID userId, ShopUserRole role) {
                return shopUserRepository.findByShopIdAndUserId(shopId, userId)
                                .map(shopUser -> shopUser.getRole().equals(role))
                                .orElse(false);
        }
}