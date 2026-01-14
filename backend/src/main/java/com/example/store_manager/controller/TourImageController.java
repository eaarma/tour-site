package com.example.store_manager.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.store_manager.service.TourImageService;
import com.example.store_manager.utility.ApiError;
import com.example.store_manager.utility.Result;
import com.example.store_manager.utility.ResultResponseMapper;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/tours")
@RequiredArgsConstructor
public class TourImageController {

        private final TourImageService tourImageService;

        @GetMapping("/{tourId}/images")
        public ResponseEntity<?> getTourImages(@PathVariable("tourId") Long tourId) {
                return ResultResponseMapper.toResponse(
                                tourImageService.getImagesByTour(tourId));
        }

        @PostMapping("/{tourId}/images")
        public ResponseEntity<?> addImage(
                        @PathVariable("tourId") Long tourId,
                        @RequestBody Map<String, String> body) {

                String imageUrl = body.get("imageUrl");

                if (imageUrl == null || imageUrl.isBlank()) {
                        return ResultResponseMapper.toResponse(
                                        Result.fail(ApiError.badRequest("imageUrl is required")));
                }

                return ResultResponseMapper.toResponse(
                                tourImageService.addImageToTour(tourId, imageUrl));
        }

        @DeleteMapping("/{tourId}/images/{imageId}")
        public ResponseEntity<?> deleteImage(
                        @PathVariable("tourId") Long tourId,
                        @PathVariable("imageId") Long imageId) {

                return ResultResponseMapper.toResponse(
                                tourImageService.deleteImage(tourId, imageId));
        }

        @PutMapping("/{tourId}/images/reorder")
        public ResponseEntity<?> reorderImages(
                        @PathVariable("tourId") Long tourId,
                        @RequestBody List<Long> orderedImageIds) {

                return ResultResponseMapper.toResponse(
                                tourImageService.updateImageOrder(tourId, orderedImageIds));
        }
}
