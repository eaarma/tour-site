package com.example.store_manager.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.store_manager.dto.tour.TourCreateDto;
import com.example.store_manager.dto.tour.TourResponseDto;
import com.example.store_manager.service.TourService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/tours")
@RequiredArgsConstructor
public class TourController {

    private final TourService tourService;

    @PostMapping
    public ResponseEntity<TourResponseDto> createTour(@RequestBody @Valid TourCreateDto dto,
            Principal principal) {
        long shopId = dto.getShopId();
        return ResponseEntity.ok(tourService.createTour(shopId, dto, principal));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TourResponseDto> updateTour(@PathVariable Long id,
            @RequestBody @Valid TourCreateDto dto) {
        return ResponseEntity.ok(tourService.updateTour(id, dto));
    }

    // ✅ fetch literally everything
    @GetMapping
    public ResponseEntity<List<TourResponseDto>> getAllTours() {
        return ResponseEntity.ok(tourService.getAllTours());
    }

    @GetMapping("/query")
    public Page<TourResponseDto> getAllByQuery(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "title,asc") String[] sort,
            @RequestParam(required = false) List<String> category,
            @RequestParam(required = false) List<String> language,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String date) {
        return tourService.getAllByQuery(category, type, language, keyword, date, page, size, sort);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TourResponseDto> getTourById(@PathVariable Long id) {
        return ResponseEntity.ok(tourService.getTourById(id));
    }

    @GetMapping("/shop/{shopId}")
    public ResponseEntity<List<TourResponseDto>> getToursByShop(@PathVariable Long shopId) {
        return ResponseEntity.ok(tourService.getToursByShopId(shopId));
    }

    // GET /tours/random?count=8
    @GetMapping("/random")
    public ResponseEntity<List<TourResponseDto>> getRandomTours(@RequestParam(defaultValue = "8") int count) {
        return ResponseEntity.ok(tourService.getRandomTours(count));
    }

    // GET /tours/highlighted
    @GetMapping("/highlighted")
    public ResponseEntity<TourResponseDto> getHighlightedTour() {
        return ResponseEntity.ok(tourService.getHighlightedTour());
    }
}