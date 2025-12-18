package com.example.store_manager.service;

import com.example.store_manager.model.Tour;
import com.example.store_manager.model.TourImage;
import com.example.store_manager.repository.TourImageRepository;
import com.example.store_manager.repository.TourRepository;
import com.example.store_manager.utility.Result;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TourImageServiceTest {

    @Mock
    private TourRepository tourRepository;

    @Mock
    private TourImageRepository tourImageRepository;

    @InjectMocks
    private TourImageService service;

    @Test
    void getImagesByTour_returnsOkList() {
        TourImage img1 = new TourImage();
        img1.setPosition(0);

        TourImage img2 = new TourImage();
        img2.setPosition(1);

        when(tourImageRepository.findByTourIdOrderByPositionAsc(1L))
                .thenReturn(List.of(img1, img2));

        Result<List<TourImage>> result = service.getImagesByTour(1L);

        assertTrue(result.isOk());
        assertEquals(2, result.get().size());
        assertSame(img1, result.get().get(0));
        assertSame(img2, result.get().get(1));
    }

    @Test
    void addImageToTour_returnsOk_whenValid() {
        Tour tour = new Tour();
        tour.setImages(new ArrayList<>());

        TourImage savedImage = new TourImage();
        savedImage.setId(10L);

        when(tourRepository.findById(1L))
                .thenReturn(Optional.of(tour));
        when(tourImageRepository.save(any(TourImage.class)))
                .thenReturn(savedImage);

        Result<TourImage> result = service.addImageToTour(1L, "url");

        assertTrue(result.isOk());
        assertSame(savedImage, result.get());
        assertEquals(1, tour.getImages().size());
        assertEquals(savedImage, tour.getImages().get(0));

        verify(tourImageRepository).save(any(TourImage.class));
    }

    @Test
    void addImageToTour_returnsFail_whenTourNotFound() {
        when(tourRepository.findById(1L))
                .thenReturn(Optional.empty());

        Result<TourImage> result = service.addImageToTour(1L, "url");

        assertTrue(result.isFail());
        assertEquals("NOT_FOUND", result.error().code());
        assertEquals("Tour not found", result.error().message());
    }

    @Test
    void deleteImage_returnsOk_whenExists() {
        when(tourImageRepository.existsById(5L))
                .thenReturn(true);

        Result<Boolean> result = service.deleteImage(1L, 5L);

        assertTrue(result.isOk());
        assertTrue(result.get());
        verify(tourImageRepository).deleteById(5L);
    }

    @Test
    void deleteImage_returnsFail_whenNotFound() {
        when(tourImageRepository.existsById(5L))
                .thenReturn(false);

        Result<Boolean> result = service.deleteImage(1L, 5L);

        assertTrue(result.isFail());
        assertEquals("NOT_FOUND", result.error().code());
        assertEquals("Image not found", result.error().message());
    }

    @Test
    void updateImageOrder_returnsOk_andReorders() {
        TourImage img1 = new TourImage();
        img1.setId(1L);
        img1.setPosition(0);

        TourImage img2 = new TourImage();
        img2.setId(2L);
        img2.setPosition(1);

        List<TourImage> images = new ArrayList<>(List.of(img1, img2));

        when(tourImageRepository.findByTourIdOrderByPositionAsc(1L))
                .thenReturn(images);

        Result<Boolean> result = service.updateImageOrder(1L, List.of(2L, 1L));

        assertTrue(result.isOk());
        assertEquals(1, img1.getPosition());
        assertEquals(0, img2.getPosition());

        verify(tourImageRepository).saveAll(images);
    }
}
