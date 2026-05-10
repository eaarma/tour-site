package com.tourhub.storefront.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tourhub.common.result.ResultResponseMapper;
import com.tourhub.storefront.dto.UpdateStorefrontSettingsRequestDto;
import com.tourhub.storefront.service.StorefrontSettingsService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/storefront")
@RequiredArgsConstructor
public class StorefrontSettingsController {

    private final StorefrontSettingsService storefrontSettingsService;

    @GetMapping
    public ResponseEntity<?> getStorefrontSettings() {
        return ResultResponseMapper.toResponse(storefrontSettingsService.getSettings());
    }

    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateStorefrontSettings(@Valid @RequestBody UpdateStorefrontSettingsRequestDto dto) {
        return ResultResponseMapper.toResponse(storefrontSettingsService.updateSettings(dto));
    }
}

