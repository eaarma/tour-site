package com.example.store_manager.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.store_manager.dto.shop.ShopCreateRequestDto;
import com.example.store_manager.dto.shop.ShopDto;
import com.example.store_manager.security.CurrentUserService;
import com.example.store_manager.service.ShopService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/shops")
@RequiredArgsConstructor
public class ShopController {

    private final ShopService shopService;
    private final CurrentUserService currentUserService;

    @PostMapping
    public ResponseEntity<ShopDto> createShop(@RequestBody ShopCreateRequestDto dto) {
        UUID currentUserId = currentUserService.getCurrentUserId();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(shopService.createShop(dto, currentUserId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ShopDto> getShop(@PathVariable Long id) {
        return ResponseEntity.ok(shopService.getShop(id));
    }

    @PutMapping("/{shopId}")
    public ResponseEntity<ShopDto> updateShop(
            @PathVariable Long shopId,
            @RequestBody ShopCreateRequestDto dto) {
        UUID currentUserId = currentUserService.getCurrentUserId();
        ShopDto updatedShop = shopService.updateShop(shopId, dto, currentUserId);
        return ResponseEntity.ok(updatedShop);
    }

    @GetMapping
    public ResponseEntity<List<ShopDto>> getAllShops() {
        return ResponseEntity.ok(shopService.getAllShops());
    }
}