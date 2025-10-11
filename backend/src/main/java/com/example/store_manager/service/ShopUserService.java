package com.example.store_manager.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

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

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ShopUserService {

        private final ShopUserRepository shopUserRepository;
        private final UserRepository userRepository;
        private final ShopRepository shopRepository;
        private final ShopUserMapper shopUserMapper;

        public List<ShopUserDto> getUsersByShopId(Long shopId) {
                return shopUserRepository.findByShopId(shopId)
                                .stream()
                                .map(shopUserMapper::toDto)
                                .toList();
        }

        public List<ShopUserStatusDto> getShopsForUser(UUID userId) {
                return shopUserRepository.findByUserId(userId)
                                .stream()
                                .map(shopUserMapper::toStatusDto)
                                .toList();
        }

        public void addUserToShop(Long shopId, UUID userIdToAdd, String role, UUID currentUserId) {
                if (!hasShopRole(shopId, currentUserId, ShopUserRole.MANAGER)) {
                        throw new AccessDeniedException("Only MANAGER can add users to the shop.");
                }

                Shop shop = shopRepository.findById(shopId)
                                .orElseThrow(() -> new RuntimeException("Shop not found"));

                User user = userRepository.findById(userIdToAdd)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                ShopUser shopUser = ShopUser.builder()
                                .shop(shop)
                                .user(user)
                                .role(ShopUserRole.valueOf(role.toUpperCase()))
                                .status(ShopUserStatus.PENDING)
                                .createdAt(LocalDateTime.now())
                                .build();

                shopUserRepository.save(shopUser);
        }

        public void updateUserStatus(Long shopId, UUID userId, String status, UUID currentUserId) {
                if (!hasShopRole(shopId, currentUserId, ShopUserRole.MANAGER)) {
                        throw new AccessDeniedException("Only MANAGER can change user statuses in the shop.");
                }

                ShopUser shopUser = shopUserRepository.findByShopIdAndUserId(shopId, userId)
                                .orElseThrow(() -> new RuntimeException("Shop user not found"));

                shopUser.setStatus(ShopUserStatus.valueOf(status.toUpperCase()));
                shopUserRepository.save(shopUser);
        }

        public boolean hasShopRole(Long shopId, UUID userId, ShopUserRole role) {
                return shopUserRepository.findByShopIdAndUserId(shopId, userId)
                                .map(shopUser -> shopUser.getRole().equals(role))
                                .orElse(false);
        }

        public void requestToJoinShop(Long shopId, UUID currentUserId) {
                Shop shop = shopRepository.findById(shopId)
                                .orElseThrow(() -> new RuntimeException("Shop not found"));

                User user = userRepository.findById(currentUserId)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                // Prevent duplicates
                if (shopUserRepository.findByShopIdAndUserId(shopId, currentUserId).isPresent()) {
                        throw new IllegalStateException(
                                        "You already have a membership or pending request for this shop.");
                }

                ShopUser shopUser = ShopUser.builder()
                                .shop(shop)
                                .user(user)
                                .role(ShopUserRole.GUIDE) // default role (or GUEST/PENDING)
                                .status(ShopUserStatus.PENDING)
                                .createdAt(LocalDateTime.now())
                                .build();

                shopUserRepository.save(shopUser);
        }

        public void requestJoinShop(Long shopId, UUID userId) {
                Shop shop = shopRepository.findById(shopId)
                                .orElseThrow(() -> new RuntimeException("Shop not found"));
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                boolean alreadyExists = shopUserRepository.findByShopIdAndUserId(shopId, userId).isPresent();
                if (alreadyExists) {
                        throw new IllegalStateException("Already requested or a member of this shop");
                }

                ShopUser shopUser = ShopUser.builder()
                                .shop(shop)
                                .user(user)
                                .role(ShopUserRole.GUIDE) // default role
                                .status(ShopUserStatus.PENDING)
                                .createdAt(LocalDateTime.now())
                                .build();

                shopUserRepository.save(shopUser);
        }

        public void updateUserRole(Long shopId, UUID userId, String role, UUID currentUserId) {
                if (!hasShopRole(shopId, currentUserId, ShopUserRole.MANAGER)) {
                        throw new AccessDeniedException("Only MANAGER can change user roles in the shop.");
                }

                ShopUser shopUser = shopUserRepository.findByShopIdAndUserId(shopId, userId)
                                .orElseThrow(() -> new RuntimeException("Shop user not found"));

                shopUser.setRole(ShopUserRole.valueOf(role.toUpperCase()));
                shopUserRepository.save(shopUser);
        }

}