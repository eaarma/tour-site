package com.example.store_manager.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
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

        public List<ShopUserDto> getActiveMembersForShop(Long shopId) {
                return shopUserRepository.findByShopIdAndStatus(shopId, ShopUserStatus.ACTIVE)
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

        @ShopAccess(AccessLevel.MANAGER)
        public void addUserToShop(Long shopId, UUID userIdToAdd, String role) {

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

        @ShopAccess(AccessLevel.MANAGER)
        public void updateUserStatus(Long shopId, UUID userId, String status) {
                ShopUser shopUser = shopUserRepository.findByShopIdAndUserId(shopId, userId)
                                .orElseThrow(() -> new RuntimeException("Shop user not found"));

                shopUser.setStatus(ShopUserStatus.valueOf(status.toUpperCase()));
                shopUserRepository.save(shopUser);
        }

        @ShopAccess(AccessLevel.MANAGER)
        public void updateUserRole(Long shopId, UUID userId, String role) {
                ShopUser shopUser = shopUserRepository.findByShopIdAndUserId(shopId, userId)
                                .orElseThrow(() -> new RuntimeException("Shop user not found"));

                shopUser.setRole(ShopUserRole.valueOf(role.toUpperCase()));
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

        public boolean isMemberOfShop(Long shopId, UUID userId) {
                return shopUserRepository.existsByUserIdAndShopId(userId, shopId);
        }

        public ShopMembershipStatusDto getMembership(Long shopId, UUID userId) {
                return shopUserRepository.findByShopIdAndUserId(shopId, userId)
                                .map(shopUser -> ShopMembershipStatusDto.builder()
                                                .member(true)
                                                .role(shopUser.getRole())
                                                .status(shopUser.getStatus())
                                                .build())
                                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Not a member"));
        }

}