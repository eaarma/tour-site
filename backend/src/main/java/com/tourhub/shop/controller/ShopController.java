package com.tourhub.shop.controller;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.tourhub.security.CurrentUserService;
import com.tourhub.common.result.ResultResponseMapper;
import com.tourhub.shop.dto.ShopCreateRequestDto;
import com.tourhub.shop.model.ShopStatus;
import com.tourhub.shop.service.ShopService;

import lombok.RequiredArgsConstructor;

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
    public ResponseEntity<?> getShops(
            @RequestParam(name = "query", required = false) String query,
            @RequestParam(name = "status", required = false) ShopStatus status,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {

        return ResultResponseMapper.toResponse(
                shopService.searchShops(query, status, page, size));
    }

    @PatchMapping("/{shopId}/remove")
    public ResponseEntity<?> removeShop(@PathVariable("shopId") Long shopId) {
        return ResultResponseMapper.toResponse(
                shopService.removeShop(shopId));
    }

}


