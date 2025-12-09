package com.example.store_manager.controller;

import com.example.store_manager.model.TourImage;
import com.example.store_manager.service.TourImageService;
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
    public ResponseEntity<List<TourImage>> getTourImages(@PathVariable Long tourId) {
        return ResponseEntity.ok(tourImageService.getImagesByTour(tourId));
    }

    @PostMapping("/{tourId}/images")
    public ResponseEntity<TourImage> addImage(
            @PathVariable Long tourId,
            @RequestBody Map<String, String> body) {

        String imageUrl = body.get("imageUrl");
        if (imageUrl == null || imageUrl.isEmpty()) {
            throw new IllegalArgumentException("imageUrl is required");
        }

        return ResponseEntity.ok(tourImageService.addImageToTour(tourId, imageUrl));
    }

    @DeleteMapping("/{tourId}/images/{imageId}")
    public ResponseEntity<Void> deleteImage(
            @PathVariable Long tourId,
            @PathVariable Long imageId) {
        tourImageService.deleteImage(tourId, imageId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{tourId}/images/reorder")
    public ResponseEntity<Void> reorderImages(
            @PathVariable Long tourId,
            @RequestBody List<Long> orderedImageIds) {
        tourImageService.updateImageOrder(tourId, orderedImageIds);
        return ResponseEntity.ok().build();
    }
}
