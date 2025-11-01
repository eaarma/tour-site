package com.example.store_manager.service;

import com.example.store_manager.model.Tour;
import com.example.store_manager.model.TourImage;
import com.example.store_manager.repository.TourImageRepository;
import com.example.store_manager.repository.TourRepository;
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
        image.setPosition(tour.getImages().size()); // append to end

        return tourImageRepository.save(image);
    }

    public void deleteImage(Long imageId) {
        if (!tourImageRepository.existsById(imageId)) {
            throw new RuntimeException("Image not found");
        }
        tourImageRepository.deleteById(imageId);
    }
}
