package com.example.store_manager.security.aspects;

import java.lang.reflect.Parameter;
import java.util.UUID;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import com.example.store_manager.dto.schedule.TourScheduleCreateDto;
import com.example.store_manager.model.ShopUser;
import com.example.store_manager.model.ShopUserRole;
import com.example.store_manager.model.ShopUserStatus;
import com.example.store_manager.repository.OrderItemRepository;
import com.example.store_manager.repository.ShopRepository;
import com.example.store_manager.repository.ShopUserRepository;
import com.example.store_manager.repository.TourRepository;
import com.example.store_manager.security.CustomUserDetails;
import com.example.store_manager.security.annotations.AccessLevel;
import com.example.store_manager.security.annotations.ShopAccess;
import com.example.store_manager.security.annotations.ShopIdSource;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class ShopAccessAspect {

    private final ShopUserRepository shopUserRepository;
    private final TourRepository tourRepository;
    private final OrderItemRepository orderItemRepository;

    @Before("@annotation(shopAccess)")
    public void checkShopAccess(JoinPoint jp, ShopAccess shopAccess) {

        Long shopId = resolveShopId(jp.getArgs(), shopAccess.source());

        if (shopId == null) {
            throw new AccessDeniedException("Shop ID could not be resolved");
        }

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof CustomUserDetails user)) {
            throw new AccessDeniedException("Unauthorized");
        }

        ShopUser membership = shopUserRepository
                .findByShopIdAndUserId(shopId, user.getId())
                .orElseThrow(() -> new AccessDeniedException("Not a shop member"));

        if (membership.getStatus() != ShopUserStatus.ACTIVE) {
            throw new AccessDeniedException("Membership not approved");
        }

        if (membership.getRole().getLevel() < shopAccess.value().getLevel()) {
            throw new AccessDeniedException("Insufficient access level");
        }
    }

    private Long resolveShopId(Object[] args, ShopIdSource source) {

        if (args.length == 0) {
            return null;
        }

        return switch (source) {

            case SHOP_ID -> {
                if (args[0] instanceof Long shopId) {
                    yield shopId;
                }
                yield null;
            }

            case TOUR_ID -> {
                if (args[0] instanceof Long tourId) {
                    yield tourRepository.findShopIdByTourId(tourId);
                }
                yield null;
            }

            case SESSION_ID -> {
                if (args[0] instanceof Long sessionId) {
                    yield tourRepository.findShopIdBySessionId(sessionId);
                }
                yield null;
            }

            case ITEM_ID -> {
                if (args[0] instanceof Long itemId) {
                    yield orderItemRepository.findShopIdByItemId(itemId);
                }
                yield null;
            }

            case DTO_TOUR_ID -> {
                for (Object arg : args) {
                    if (arg instanceof TourScheduleCreateDto dto && dto.getTourId() != null) {
                        yield tourRepository.findShopIdByTourId(dto.getTourId());
                    }
                }
                yield null;
            }
            case SCHEDULE_ID -> {
                if (args[0] instanceof Long scheduleId) {
                    yield tourRepository.findShopIdByScheduleId(scheduleId);
                }
                yield null;
            }

        };
    }
}
