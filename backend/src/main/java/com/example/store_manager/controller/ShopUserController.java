package com.example.store_manager.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.store_manager.dto.shop.ShopUserDto;
import com.example.store_manager.dto.shop.ShopUserStatusDto;
import com.example.store_manager.security.CurrentUserService;
import com.example.store_manager.service.ShopUserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/shop-users")
@RequiredArgsConstructor
public class ShopUserController {

    private final ShopUserService shopUserService;
    private final CurrentUserService currentUserService;

    @GetMapping("/shop/{shopId}")
    public ResponseEntity<List<ShopUserDto>> getUsersForShop(@PathVariable Long shopId) {
        return ResponseEntity.ok(shopUserService.getUsersByShopId(shopId));
    }

    @GetMapping("/user/me")
    public ResponseEntity<List<ShopUserStatusDto>> getShopsForCurrentUser() {
        UUID currentUserId = currentUserService.getCurrentUserId();
        return ResponseEntity.ok(shopUserService.getShopsForUser(currentUserId));
    }

    @PostMapping("/{shopId}/{userId}")
    public ResponseEntity<Void> addUserToShop(
            @PathVariable Long shopId,
            @PathVariable UUID userId,
            @RequestParam String role) {
        UUID currentUserId = currentUserService.getCurrentUserId();
        shopUserService.addUserToShop(shopId, userId, role, currentUserId);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PatchMapping("/{shopId}/{userId}/status")
    public ResponseEntity<Void> updateStatus(
            @PathVariable Long shopId,
            @PathVariable UUID userId,
            @RequestParam String status) {
        UUID currentUserId = currentUserService.getCurrentUserId();
        shopUserService.updateUserStatus(shopId, userId, status, currentUserId);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{shopId}/{userId}/role")
    public ResponseEntity<Void> updateRole(
            @PathVariable Long shopId,
            @PathVariable UUID userId,
            @RequestParam String role) {
        UUID currentUserId = currentUserService.getCurrentUserId();
        shopUserService.updateUserRole(shopId, userId, role, currentUserId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/shop/{shopId}/request")
    public ResponseEntity<Void> requestJoinShop(@PathVariable Long shopId) {
        UUID currentUserId = currentUserService.getCurrentUserId();
        shopUserService.requestJoinShop(shopId, currentUserId);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

}