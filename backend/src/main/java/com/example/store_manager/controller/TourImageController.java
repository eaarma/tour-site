package com.example.store_manager.controller;

import com.example.store_manager.model.TourImage;
import com.example.store_manager.service.TourImageService;
import com.example.store_manager.utility.ApiError;
import com.example.store_manager.utility.Result;
import com.example.store_manager.utility.ResultResponseMapper;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tours")
@RequiredArgsConstructor
public class TourImageController {

    private final TourImageService tourImageService;

    @GetMapping("/{tourId}/images")
    public ResponseEntity<?> getTourImages(@PathVariable Long tourId) {
        return ResultResponseMapper.toResponse(
                tourImageService.getImagesByTour(tourId));
    }

    @PostMapping("/{tourId}/images")
    public ResponseEntity<?> addImage(
            @PathVariable Long tourId,
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
            @PathVariable Long tourId,
            @PathVariable Long imageId) {

        return ResultResponseMapper.toResponse(
                tourImageService.deleteImage(tourId, imageId));
    }

    @PutMapping("/{tourId}/images/reorder")
    public ResponseEntity<?> reorderImages(
            @PathVariable Long tourId,
            @RequestBody List<Long> orderedImageIds) {

        return ResultResponseMapper.toResponse(
                tourImageService.updateImageOrder(tourId, orderedImageIds));
    }
}
