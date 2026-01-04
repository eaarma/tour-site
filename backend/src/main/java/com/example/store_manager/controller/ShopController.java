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
import com.example.store_manager.utility.ResultResponseMapper;

@RestController
@RequestMapping("/shops")
@RequiredArgsConstructor
public class ShopController {

    private final ShopService shopService;
    private final CurrentUserService currentUserService;

    @PostMapping
    public ResponseEntity<?> createShop(@RequestBody ShopCreateRequestDto dto) {
        UUID currentUserId = currentUserService.getCurrentUserId();

        return ResultResponseMapper.toResponse(
                shopService.createShop(dto, currentUserId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getShop(@PathVariable("id") Long id) {
        return ResultResponseMapper.toResponse(
                shopService.getShop(id));
    }

    @PutMapping("/{shopId}")
    public ResponseEntity<?> updateShop(
            @PathVariable("shopId") Long shopId,
            @RequestBody ShopCreateRequestDto dto) {

        return ResultResponseMapper.toResponse(
                shopService.updateShop(shopId, dto));
    }

    @GetMapping
    public ResponseEntity<?> getAllShops() {
        return ResultResponseMapper.toResponse(
                shopService.getAllShops());
    }
}
