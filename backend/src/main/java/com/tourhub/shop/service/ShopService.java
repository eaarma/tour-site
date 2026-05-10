package com.tourhub.shop.service;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tourhub.security.CurrentUserService;
import com.tourhub.security.annotations.AccessLevel;
import com.tourhub.security.annotations.ShopAccess;
import com.tourhub.security.annotations.ShopIdSource;
import com.tourhub.common.result.ApiError;
import com.tourhub.common.result.Result;
import com.tourhub.shop.dto.ShopCreateRequestDto;
import com.tourhub.shop.dto.ShopDto;
import com.tourhub.shop.mapper.ShopMapper;
import com.tourhub.shop.model.Shop;
import com.tourhub.shop.model.ShopStatus;
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
public class ShopService {

        private final ShopRepository shopRepository;
        private final ShopMapper shopMapper;
        private final ShopUserRepository shopUserRepository;
        private final UserRepository userRepository;
        private final CurrentUserService currentUserService;

        @Transactional
        public Result<ShopDto> createShop(ShopCreateRequestDto dto, UUID currentUserId) {

                try {
                        assertCanCreateShop();
                } catch (AccessDeniedException ex) {
                        return Result.fail(ApiError.forbidden(ex.getMessage()));
                }

                User user = userRepository.findById(currentUserId)
                                .orElse(null);

                if (user == null) {
                        return Result.fail(ApiError.notFound("User not found"));
                }

                Shop shop = Shop.builder()
                                .name(dto.getName())
                                .description(dto.getDescription())
                                .bankAccountName(dto.getBankAccountName())
                                .bankAccountIban(dto.getBankAccountIban())
                                .status(ShopStatus.ACTIVE)
                                .build();

                Shop savedShop = shopRepository.save(shop);

                ShopUser shopUser = ShopUser.builder()
                                .shop(savedShop)
                                .user(user)
                                .role(ShopUserRole.OWNER)
                                .status(ShopUserStatus.ACTIVE)
                                .build();

                shopUserRepository.save(shopUser);

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

        @Transactional(readOnly = true)
        public Result<Page<ShopDto>> searchShops(
                        String query,
                        ShopStatus status,
                        int page,
                        int size) {

                Pageable pageable = PageRequest.of(
                                page,
                                size,
                                Sort.by("id").descending());

                String normalizedQuery = normalizeQuery(query);
                boolean applyQuery = normalizedQuery != null;
                String queryPattern = applyQuery ? "%" + normalizedQuery + "%" : "%";

                Page<Shop> result = shopRepository.searchShops(
                                applyQuery,
                                queryPattern,
                                status,
                                pageable);

                return Result.ok(result.map(shopMapper::toDto));
        }

        @Transactional
        public Result<Void> removeShop(Long shopId) {

                Shop shop = shopRepository.findById(shopId)
                                .orElse(null);

                if (shop == null) {
                        return Result.fail(ApiError.notFound("Shop not found"));
                }

                try {
                        assertCanRemoveShop(shopId);
                } catch (AccessDeniedException ex) {
                        return Result.fail(ApiError.forbidden(ex.getMessage()));
                }

                shop.setStatus(ShopStatus.REMOVED);
                shopRepository.save(shop);

                return Result.ok();
        }

        private void assertCanRemoveShop(Long shopId) {
                UUID currentUserId = currentUserService.getCurrentUserId();

                if (currentUserId == null) {
                        throw new AccessDeniedException("Unauthorized");
                }

                if (currentUserService.hasRole("ADMIN")) {
                        return;
                }

                ShopUser membership = shopUserRepository.findByShopIdAndUserId(shopId, currentUserId)
                                .orElseThrow(() -> new AccessDeniedException("Only admins or shop owners can remove shops"));

                if (membership.getStatus() != ShopUserStatus.ACTIVE || membership.getRole() != ShopUserRole.OWNER) {
                        throw new AccessDeniedException("Only admins or shop owners can remove shops");
                }
        }

        private void assertCanCreateShop() {
                if (currentUserService.hasRole("ADMIN") || currentUserService.hasRole("MANAGER")) {
                        return;
                }

                throw new AccessDeniedException("Only managers or admins can create shops");
        }

        private String normalizeQuery(String query) {
                if (query == null) {
                        return null;
                }

                String trimmedQuery = query.trim();
                if (trimmedQuery.isEmpty()) {
                        return null;
                }

                return trimmedQuery.toLowerCase();
        }
}


