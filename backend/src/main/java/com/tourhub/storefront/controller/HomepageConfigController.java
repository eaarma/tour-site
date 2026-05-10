package com.tourhub.storefront.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tourhub.common.result.ResultResponseMapper;
import com.tourhub.storefront.dto.UpdateHomepageConfigRequestDto;
import com.tourhub.storefront.service.HomepageConfigService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/storefront/homepage")
@RequiredArgsConstructor
public class HomepageConfigController {

    private final HomepageConfigService homepageConfigService;

    @GetMapping
    public ResponseEntity<?> getHomepageConfig() {
        return ResultResponseMapper.toResponse(homepageConfigService.getHomepageConfig());
    }

    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateHomepageConfig(@Valid @RequestBody UpdateHomepageConfigRequestDto dto) {
        return ResultResponseMapper.toResponse(homepageConfigService.updateHomepageConfig(dto));
    }
}

