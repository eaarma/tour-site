package com.example.store_manager.service;

import com.example.store_manager.model.Tour;
import com.example.store_manager.model.TourImage;
import com.example.store_manager.repository.TourImageRepository;
import com.example.store_manager.repository.TourRepository;
import com.example.store_manager.security.annotations.AccessLevel;
import com.example.store_manager.security.annotations.ShopAccess;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TourImageService {

    private final TourRepository tourRepository;
    private final TourImageRepository tourImageRepository;

    public List<TourImage> getImagesByTour(Long tourId) {
        return tourImageRepository.findByTourIdOrderByPositionAsc(tourId);
    }

    @ShopAccess(AccessLevel.MANAGER)
    public TourImage addImageToTour(Long tourId, String imageUrl) {

        Tour tour = tourRepository.findById(tourId)
                .orElseThrow(() -> new RuntimeException("Tour not found"));

        TourImage image = new TourImage();
        image.setTour(tour);
        image.setImageUrl(imageUrl);
        image.setPosition(tour.getImages().size());

        TourImage savedImage = tourImageRepository.save(image);
        tour.getImages().add(savedImage);

        return savedImage;
    }

    @ShopAccess(AccessLevel.MANAGER)
    public void deleteImage(Long tourId, Long imageId) {
        if (!tourImageRepository.existsById(imageId)) {
            throw new RuntimeException("Image not found");
        }
        tourImageRepository.deleteById(imageId);
    }

    @ShopAccess(AccessLevel.MANAGER)
    @Transactional
    public void updateImageOrder(Long tourId, List<Long> orderedImageIds) {

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
    }

}
