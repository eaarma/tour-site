package com.example.store_manager.service;

import com.example.store_manager.model.Tour;
import com.example.store_manager.model.TourImage;
import com.example.store_manager.repository.TourImageRepository;
import com.example.store_manager.repository.TourRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
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

    public TourImage addImageToTour(Long tourId, String imageUrl) {
        Tour tour = tourRepository.findById(tourId)
                .orElseThrow(() -> new RuntimeException("Tour not found"));

        TourImage image = new TourImage();
        image.setTour(tour);
        image.setImageUrl(imageUrl);
        image.setPosition(tour.getImages().size()); // ✅ safe if images is initialized

        TourImage savedImage = tourImageRepository.save(image);
        tour.getImages().add(savedImage); // ✅ add to in-memory collection too
        return savedImage;
    }

    public void deleteImage(Long imageId) {
        if (!tourImageRepository.existsById(imageId)) {
            throw new RuntimeException("Image not found");
        }
        tourImageRepository.deleteById(imageId);
    }

    // Service
    @Transactional
    public void updateImageOrder(Long tourId, List<Long> orderedImageIds) {
        List<TourImage> images = tourImageRepository.findByTourIdOrderByPositionAsc(tourId);

        // Iterate through ordered list and assign new positions
        for (int i = 0; i < orderedImageIds.size(); i++) {
            Long imageId = orderedImageIds.get(i);

            // Find the TourImage entity with matching ID
            for (TourImage img : images) {
                if (img.getId().equals(imageId)) {
                    img.setPosition(i); // Assign the new index
                    break;
                }
            }
        }

        tourImageRepository.saveAll(images);
    }

}
