package com.tourhub.tour.controller;

import java.security.Principal;
import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.tourhub.tour.dto.TourCreateDto;
import com.tourhub.tour.dto.TourResponseDto;
import com.tourhub.tour.dto.TourUpdateDto;
import com.tourhub.tour.service.TourService;
import com.tourhub.common.result.ResultResponseMapper;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/tours")
@RequiredArgsConstructor
public class TourController {

        private final TourService tourService;

        @PostMapping
        public ResponseEntity<?> createTour(
                        @RequestBody @Valid TourCreateDto dto,
                        Principal principal) {

                return ResultResponseMapper.toResponse(
                                tourService.createTour(dto.getShopId(), dto, principal));
        }

        @PutMapping("/{id}")
        public ResponseEntity<?> updateTour(
                        @PathVariable("id") Long id,
                        @RequestBody @Valid TourUpdateDto dto) {

                return ResultResponseMapper.toResponse(
                                tourService.updateTour(id, dto));
        }

        @GetMapping("/admin")
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<?> getToursForAdmin(
                        @RequestParam(name = "query", required = false) String query,
                        @RequestParam(name = "status", required = false) String status,
                        @RequestParam(name = "page", defaultValue = "0") int page,
                        @RequestParam(name = "size", defaultValue = "10") int size) {

                return ResultResponseMapper.toResponse(
                                tourService.searchToursForAdmin(query, status, page, size));
        }

        @GetMapping
        public ResponseEntity<?> getAllTours() {
                return ResultResponseMapper.toResponse(
                                tourService.getAllTours());
        }

        @GetMapping("/query")
        public ResponseEntity<?> getAllByQuery(
                        @RequestParam(name = "page", defaultValue = "0") int page,
                        @RequestParam(name = "size", defaultValue = "12") int size,
                        @RequestParam(name = "sort", defaultValue = "title,asc") String[] sort,
                        @RequestParam(name = "categories", required = false) List<String> categories,
                        @RequestParam(name = "language", required = false) List<String> language,
                        @RequestParam(name = "type", required = false) List<String> type,
                        @RequestParam(name = "keyword", required = false) String keyword,
                        @RequestParam(name = "date", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

                return ResultResponseMapper.toResponse(
                                tourService.getAllByQuery(
                                                categories,
                                                type,
                                                language,
                                                keyword,
                                                date,
                                                page,
                                                size,
                                                sort));
        }

        @GetMapping("/{id}")
        public ResponseEntity<?> getTourById(@PathVariable("id") Long id) {
                return ResultResponseMapper.toResponse(
                                tourService.getTourById(id));
        }

        @PatchMapping("/{id}/status")
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<?> updateTourStatus(
                        @PathVariable("id") Long id,
                        @RequestParam("status") String status) {

                return ResultResponseMapper.toResponse(
                                tourService.updateTourStatus(id, status));
        }

        @GetMapping("/shop/{shopId}")
        public ResponseEntity<?> getToursByShop(@PathVariable("shopId") Long shopId) {
                return ResultResponseMapper.toResponse(
                                tourService.getToursByShopId(shopId));
        }

        // GET /tours/random?count=8
        @GetMapping("/random")
        public ResponseEntity<?> getRandomTours(
                        @RequestParam(name = "count", defaultValue = "8") int count) {

                return ResultResponseMapper.toResponse(
                                tourService.getRandomTours(count));
        }

        // GET /tours/category/random?category=HIKING&count=4
        @GetMapping("/category/random")
        public ResponseEntity<?> getRandomToursByCategory(
                        @RequestParam(name = "category") String category,
                        @RequestParam(name = "count", defaultValue = "4") int count) {

                return ResultResponseMapper.toResponse(
                                tourService.getRandomToursByCategory(category, count));
        }

        // GET /tours/highlighted
        @GetMapping("/highlighted")
        public ResponseEntity<?> getHighlightedTour() {
                return ResultResponseMapper.toResponse(
                                tourService.getHighlightedTour());
        }
}

