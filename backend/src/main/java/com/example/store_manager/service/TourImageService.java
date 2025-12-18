package com.example.store_manager.service;

import com.example.store_manager.model.Tour;
import com.example.store_manager.model.TourImage;
import com.example.store_manager.repository.TourImageRepository;
import com.example.store_manager.repository.TourRepository;
import com.example.store_manager.security.annotations.AccessLevel;
import com.example.store_manager.security.annotations.ShopAccess;
import com.example.store_manager.utility.ApiError;
import com.example.store_manager.utility.Result;

import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import java.util.List;

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
    @ShopAccess(AccessLevel.MANAGER)
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
    @ShopAccess(AccessLevel.MANAGER)
    public Result<Boolean> deleteImage(Long tourId, Long imageId) {

        if (!tourImageRepository.existsById(imageId)) {
            return Result.fail(ApiError.notFound("Image not found"));
        }

        tourImageRepository.deleteById(imageId);
        return Result.ok(true);
    }

    @Transactional
    @ShopAccess(AccessLevel.MANAGER)
    public Result<Boolean> updateImageOrder(
            Long tourId,
            List<Long> orderedImageIds) {

        List<TourImage> images = tourImageRepository.findByTourIdOrderByPositionAsc(tourId);

        for (int i = 0; i < orderedImageIds.size(); i++) {
            Long imageId = orderedImageIds.get(i);

            for (TourImage img : images) {
                if (img.getId().equals(imageId)) {
                    img.setPosition(i);
                    break;
                }
            }
        }

        tourImageRepository.saveAll(images);
        return Result.ok(true);
    }
}
