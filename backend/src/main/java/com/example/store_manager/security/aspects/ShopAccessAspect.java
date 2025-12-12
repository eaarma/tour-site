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
    private final ShopRepository shopRepository;

    @Before("@annotation(com.example.store_manager.security.annotations.ShopAccess)")
    public void checkShopAccess(JoinPoint joinPoint) {

        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        ShopAccess annotation = signature.getMethod().getAnnotation(ShopAccess.class);
        AccessLevel requiredLevel = annotation.value();

        // -------------------------
        // 1️⃣ Extract shopId
        // -------------------------
        Long shopId = extractShopId(joinPoint);

        if (shopId == null) {
            throw new AccessDeniedException("Shop ID could not be determined.");
        }

        // -------------------------
        // 2️⃣ Get authenticated user
        // -------------------------
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !(auth.getPrincipal() instanceof CustomUserDetails userDetails)) {
            throw new AccessDeniedException("Unauthorized");
        }

        UUID userId = userDetails.getId();

        // -------------------------
        // 3️⃣ Load membership (must exist)
        // -------------------------
        ShopUser membership = shopUserRepository
                .findByShopIdAndUserId(shopId, userId)
                .orElseThrow(() -> new AccessDeniedException("You are not a member of this shop."));

        // -------------------------
        // 4️⃣ Enforce membership status
        // -------------------------
        if (membership.getStatus() != ShopUserStatus.ACTIVE) {
            throw new AccessDeniedException("Membership is not approved.");
        }

        // -------------------------
        // 5️⃣ Enforce role
        ShopUserRole role = membership.getRole();

        if (role.getLevel() < requiredLevel.getLevel()) {
            throw new AccessDeniedException("Access level too low");
        }

    }

    // -------------------------------------------------------------------
    // Extract shopId from parameters: shopId → tourId → scheduleId → itemId
    // -------------------------------------------------------------------
    private Long extractShopId(JoinPoint jp) {
        Object[] args = jp.getArgs();
        Parameter[] params = ((MethodSignature) jp.getSignature()).getMethod().getParameters();

        // shopId
        for (int i = 0; i < params.length; i++) {
            if (params[i].getName().equals("shopId") && args[i] instanceof Long id) {
                return id;
            }
        }

        // tourId
        for (int i = 0; i < params.length; i++) {
            if (params[i].getName().equals("tourId") && args[i] instanceof Long tourId) {
                return tourRepository.findShopIdByTourId(tourId);
            }
        }

        // scheduleId (path variable "id")
        for (int i = 0; i < params.length; i++) {
            if (params[i].getName().equals("id") && args[i] instanceof Long scheduleId) {
                Long tourId = tourRepository.findTourIdByScheduleId(scheduleId);
                if (tourId != null) {
                    return tourRepository.findShopIdByTourId(tourId);
                }
            }
        }

        // order item
        for (int i = 0; i < params.length; i++) {
            if (params[i].getName().equals("itemId") && args[i] instanceof Long itemId) {
                return orderItemRepository.findShopIdByItemId(itemId);
            }
        }

        // DTO containing tourId → schedule creation, schedule update, etc.
        for (Object arg : args) {
            if (arg instanceof TourScheduleCreateDto scheduleDto) {
                return tourRepository.findShopIdByTourId(scheduleDto.getTourId());
            }
        }

        // tour session (sessionId)
        for (int i = 0; i < params.length; i++) {
            if ((params[i].getName().equals("sessionId") || params[i].getName().equals("id"))
                    && args[i] instanceof Long sessionId) {
                Long shopId = tourRepository.findShopIdBySessionId(sessionId);
                if (shopId != null) {
                    return shopId;
                }
            }
        }

        return null;

    }

}
