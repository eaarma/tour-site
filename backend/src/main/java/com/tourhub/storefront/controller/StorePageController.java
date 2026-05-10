package com.tourhub.storefront.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tourhub.common.result.ResultResponseMapper;
import com.tourhub.storefront.dto.UpdateStorePageRequestDto;
import com.tourhub.storefront.service.StorePageService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/storefront/pages")
@RequiredArgsConstructor
public class StorePageController {

    private final StorePageService storePageService;

    @GetMapping
    public ResponseEntity<?> getStorePages() {
        return ResultResponseMapper.toResponse(storePageService.getPages());
    }

    @GetMapping("/{slug}")
    public ResponseEntity<?> getStorePage(@PathVariable String slug) {
        return ResultResponseMapper.toResponse(storePageService.getPage(slug));
    }

    @PutMapping("/{slug}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateStorePage(
            @PathVariable String slug,
            @Valid @RequestBody UpdateStorePageRequestDto dto) {
        return ResultResponseMapper.toResponse(storePageService.updatePage(slug, dto));
    }
}

