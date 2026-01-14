package com.example.store_manager.service;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.store_manager.model.Tour;
import com.example.store_manager.model.TourImage;
import com.example.store_manager.repository.TourImageRepository;
import com.example.store_manager.repository.TourRepository;
import com.example.store_manager.security.annotations.AccessLevel;
import com.example.store_manager.security.annotations.ShopAccess;
import com.example.store_manager.security.annotations.ShopIdSource;
import com.example.store_manager.utility.ApiError;
import com.example.store_manager.utility.Result;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TourImageService {

    private final TourRepository tourRepository;
    private final TourImageRepository tourImageRepository;

    @Transactional(readOnly = true)
    public Result<List<TourImage>> getImagesByTour(Long tourId) {

        List<TourImage> images = tourImageRepository.findByTourIdOrderByPositionAsc(tourId);

        return Result.ok(images);
    }

    @Transactional
    @ShopAccess(value = AccessLevel.MANAGER, source = ShopIdSource.TOUR_ID)
    public Result<TourImage> addImageToTour(Long tourId, String imageUrl) {

        Tour tour = tourRepository.findById(tourId).orElse(null);
        if (tour == null) {
            return Result.fail(ApiError.notFound("Tour not found"));
        }

        TourImage image = new TourImage();
        image.setTour(tour);
        image.setImageUrl(imageUrl);
        image.setPosition(tour.getImages().size());

        TourImage savedImage = tourImageRepository.save(image);
        tour.getImages().add(savedImage);

        return Result.ok(savedImage);
    }

    @Transactional
    @ShopAccess(value = AccessLevel.MANAGER, source = ShopIdSource.TOUR_ID)
    public Result<Boolean> deleteImage(Long tourId, Long imageId) {

        if (!tourImageRepository.existsById(imageId)) {
            return Result.fail(ApiError.notFound("Image not found"));
        }

        tourImageRepository.deleteById(imageId);
        return Result.ok(true);
    }

    @Transactional
    @ShopAccess(value = AccessLevel.MANAGER, source = ShopIdSource.TOUR_ID)
    public Result<Boolean> updateImageOrder(Long tourId, List<Long> orderedImageIds) {

        List<TourImage> images = tourImageRepository.findByTourIdOrderByPositionAsc(tourId);

        if (images.isEmpty()) {
            return Result.fail(ApiError.badRequest("No images found for this tour"));
        }

        if (orderedImageIds.size() != images.size()) {
            return Result.fail(ApiError.badRequest(
                    "Image count mismatch: expected " + images.size()));
        }

        // 🔑 Map imageId → entity
        Map<Long, TourImage> imageMap = images.stream()
                .collect(Collectors.toMap(TourImage::getId, Function.identity()));

        // 🔍 Validate IDs
        for (Long id : orderedImageIds) {
            if (!imageMap.containsKey(id)) {
                return Result.fail(ApiError.badRequest(
                        "Image does not belong to this tour: " + id));
            }
        }

        // 🔄 Apply order
        for (int i = 0; i < orderedImageIds.size(); i++) {
            TourImage img = imageMap.get(orderedImageIds.get(i));
            img.setPosition(i);
        }

        tourImageRepository.saveAll(images);
        return Result.ok(true);
    }

}
