package com.tourhub.shop.service;

import java.util.List;
import java.util.UUID;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tourhub.security.CurrentUserService;
import com.tourhub.security.annotations.AccessLevel;
import com.tourhub.security.annotations.ShopAccess;
import com.tourhub.security.annotations.ShopIdSource;
import com.tourhub.common.result.ApiError;
import com.tourhub.common.result.Result;
import com.tourhub.shop.dto.PublicShopUserDto;
import com.tourhub.shop.dto.ShopMembershipStatusDto;
import com.tourhub.shop.dto.ShopUserDto;
import com.tourhub.shop.dto.ShopUserStatusDto;
import com.tourhub.shop.mapper.ShopUserMapper;
import com.tourhub.shop.model.Shop;
import com.tourhub.shop.model.ShopUser;
import com.tourhub.shop.model.ShopUserRole;
import com.tourhub.shop.model.ShopUserStatus;
import com.tourhub.shop.repository.ShopRepository;
import com.tourhub.shop.repository.ShopUserRepository;
import com.tourhub.user.model.User;
import com.tourhub.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ShopUserService {

        private final ShopUserRepository shopUserRepository;
        private final UserRepository userRepository;
        private final ShopRepository shopRepository;
        private final ShopUserMapper shopUserMapper;
        private final CurrentUserService currentUserService;

        @Transactional(readOnly = true)
        @ShopAccess(value = AccessLevel.MANAGER, source = ShopIdSource.SHOP_ID)
        public Result<List<ShopUserDto>> getUsersByShopId(Long shopId) {
                List<ShopUserDto> users = shopUserRepository.findByShopId(shopId)
                                .stream()
                                .map(shopUserMapper::toDto)
                                .toList();

                return Result.ok(users);
        }

        @Transactional(readOnly = true)
        @ShopAccess(value = AccessLevel.GUIDE, source = ShopIdSource.SHOP_ID)
        public Result<List<ShopUserDto>> getActiveMembersForShop(Long shopId) {
                List<ShopUserDto> users = shopUserRepository.findByShopIdAndStatus(shopId, ShopUserStatus.ACTIVE)
                                .stream()
                                .map(shopUserMapper::toDto)
                                .toList();

                return Result.ok(users);
        }

        @Transactional(readOnly = true)
        public Result<List<PublicShopUserDto>> getPublicActiveMembersForShop(Long shopId) {
                List<PublicShopUserDto> users = shopUserRepository.findByShopIdAndStatus(shopId, ShopUserStatus.ACTIVE)
                                .stream()
                                .map(shopUserMapper::toPublicDto)
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
        public Result<Boolean> addUserToShop(Long shopId, UUID userIdToAdd, String role) {

                Shop shop = shopRepository.findById(shopId).orElse(null);
                if (shop == null) {
                        return Result.fail(ApiError.notFound("Shop not found"));
                }

                User user = userRepository.findById(userIdToAdd).orElse(null);
                if (user == null) {
                        return Result.fail(ApiError.notFound("User not found"));
                }

                ShopUserRole shopUserRole = parseAssignableRole(role);
                if (shopUserRole == null) {
                        return Result.fail(ApiError.badRequest("Only GUIDE or MANAGER roles can be assigned"));
                }

                if (shopUserRepository.findByShopIdAndUserId(shopId, userIdToAdd).isPresent()) {
                        return Result.fail(ApiError.badRequest("User is already associated with this shop"));
                }

                try {
                        assertCanManageRoles(shopId);
                } catch (AccessDeniedException ex) {
                        return Result.fail(ApiError.forbidden(ex.getMessage()));
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
        public Result<Boolean> updateUserStatus(Long shopId, UUID userId, String status) {

                ShopUser shopUser = shopUserRepository.findByShopIdAndUserId(shopId, userId).orElse(null);

                if (shopUser == null) {
                        return Result.fail(ApiError.notFound("Shop user not found"));
                }

                ShopUserStatus newStatus = parseStatus(status);
                if (newStatus == null) {
                        return Result.fail(ApiError.badRequest("Invalid status"));
                }

                if (!isAllowedStatusTransition(shopUser.getStatus(), newStatus)) {
                        return Result.fail(ApiError.badRequest("Invalid status transition"));
                }

                try {
                        assertCanManageStatus(shopId, shopUser, newStatus);
                } catch (AccessDeniedException ex) {
                        return Result.fail(ApiError.forbidden(ex.getMessage()));
                }

                shopUser.setStatus(newStatus);
                shopUserRepository.save(shopUser);
                return Result.ok(true);
        }

        @Transactional
        public Result<Boolean> updateUserRole(Long shopId, UUID userId, String role) {

                ShopUser shopUser = shopUserRepository.findByShopIdAndUserId(shopId, userId).orElse(null);

                if (shopUser == null) {
                        return Result.fail(ApiError.notFound("Shop user not found"));
                }

                ShopUserRole newRole = parseAssignableRole(role);
                if (newRole == null) {
                        return Result.fail(ApiError.badRequest("Only GUIDE or MANAGER roles can be assigned"));
                }

                try {
                        assertCanManageRoles(shopId);
                        assertRoleCanBeChanged(shopUser);
                } catch (AccessDeniedException ex) {
                        return Result.fail(ApiError.forbidden(ex.getMessage()));
                }

                shopUser.setRole(newRole);
                shopUserRepository.save(shopUser);
                return Result.ok(true);
        }

        @Transactional
        public Result<Boolean> requestJoinShop(Long shopId, UUID userId) {

                try {
                        assertCanUseShopsWorkspace();
                } catch (AccessDeniedException ex) {
                        return Result.fail(ApiError.forbidden(ex.getMessage()));
                }

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

        private ShopUserRole parseAssignableRole(String role) {
                if (role == null || role.isBlank()) {
                        return null;
                }

                try {
                        ShopUserRole parsedRole = ShopUserRole.valueOf(role.trim().toUpperCase());
                        return switch (parsedRole) {
                                case GUIDE, MANAGER -> parsedRole;
                                default -> null;
                        };
                } catch (IllegalArgumentException ex) {
                        return null;
                }
        }

        private ShopUserStatus parseStatus(String status) {
                if (status == null || status.isBlank()) {
                        return null;
                }

                try {
                        return ShopUserStatus.valueOf(status.trim().toUpperCase());
                } catch (IllegalArgumentException ex) {
                        return null;
                }
        }

        private void assertCanManageRoles(Long shopId) {
                if (currentUserService.hasRole("ADMIN")) {
                        return;
                }

                ShopUser actingMembership = getActiveMembershipForCurrentUser(shopId);

                if (actingMembership.getRole() != ShopUserRole.OWNER) {
                        throw new AccessDeniedException("Only shop owners or admins can change member roles");
                }
        }

        private void assertCanManageStatus(Long shopId, ShopUser targetMembership, ShopUserStatus newStatus) {
                assertRoleCanBeChanged(targetMembership);

                if (isPendingApprovalDecision(targetMembership.getStatus(), newStatus)) {
                        if (currentUserService.hasRole("ADMIN")) {
                                return;
                        }

                        ShopUser actingMembership = getActiveMembershipForCurrentUser(shopId);
                        if (actingMembership.getRole().getLevel() < ShopUserRole.MANAGER.getLevel()) {
                                throw new AccessDeniedException(
                                                "Only managers, owners, or admins can approve pending members");
                        }
                        return;
                }

                if (currentUserService.hasRole("ADMIN")) {
                        return;
                }

                ShopUser actingMembership = getActiveMembershipForCurrentUser(shopId);
                if (actingMembership.getRole() != ShopUserRole.OWNER) {
                        throw new AccessDeniedException(
                                        "Only shop owners or admins can disable or reactivate members");
                }
        }

        private void assertRoleCanBeChanged(ShopUser targetMembership) {
                if (targetMembership.getRole() == ShopUserRole.OWNER) {
                        throw new AccessDeniedException("Owner memberships cannot be changed");
                }

                if (targetMembership.getRole() == ShopUserRole.ADMIN && !currentUserService.hasRole("ADMIN")) {
                        throw new AccessDeniedException("Only admins can modify admin memberships");
                }
        }

        private ShopUser getActiveMembershipForCurrentUser(Long shopId) {
                UUID currentUserId = currentUserService.getCurrentUserId();

                ShopUser actingMembership = shopUserRepository.findByShopIdAndUserId(shopId, currentUserId)
                                .orElseThrow(() -> new AccessDeniedException("You are not a member of this shop"));

                if (actingMembership.getStatus() != ShopUserStatus.ACTIVE) {
                        throw new AccessDeniedException("Membership not approved");
                }

                return actingMembership;
        }

        private boolean isPendingApprovalDecision(ShopUserStatus currentStatus, ShopUserStatus newStatus) {
                return currentStatus == ShopUserStatus.PENDING
                                && (newStatus == ShopUserStatus.ACTIVE || newStatus == ShopUserStatus.REJECTED);
        }

        private boolean isAllowedStatusTransition(ShopUserStatus currentStatus, ShopUserStatus newStatus) {
                if (currentStatus == newStatus) {
                        return true;
                }

                return isPendingApprovalDecision(currentStatus, newStatus)
                                || (currentStatus == ShopUserStatus.ACTIVE && newStatus == ShopUserStatus.DISABLED)
                                || (currentStatus == ShopUserStatus.DISABLED && newStatus == ShopUserStatus.ACTIVE);
        }

        private void assertCanUseShopsWorkspace() {
                if (currentUserService.hasRole("ADMIN") || currentUserService.hasRole("MANAGER")) {
                        return;
                }

                throw new AccessDeniedException("Only managers or admins can join shops");
        }
}


