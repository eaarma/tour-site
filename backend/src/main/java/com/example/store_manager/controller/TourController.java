package com.example.store_manager.controller;

import java.security.Principal;
import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
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
import com.example.store_manager.utility.ResultResponseMapper;

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
                        @RequestBody @Valid TourCreateDto dto) {

                return ResultResponseMapper.toResponse(
                                tourService.updateTour(id, dto));
        }

        // ✅ fetch literally everything
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
                        @RequestParam(name = "category", required = false) List<String> category,
                        @RequestParam(name = "language", required = false) List<String> language,
                        @RequestParam(name = "type", required = false) String type,
                        @RequestParam(name = "keyword", required = false) String keyword,
                        @RequestParam(name = "date", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

                return ResultResponseMapper.toResponse(
                                tourService.getAllByQuery(
                                                category,
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

        // GET /tours/highlighted
        @GetMapping("/highlighted")
        public ResponseEntity<?> getHighlightedTour() {
                return ResultResponseMapper.toResponse(
                                tourService.getHighlightedTour());
        }
}
