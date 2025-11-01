package com.example.store_manager.service;

import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.example.store_manager.dto.tour.TourCreateDto;
import com.example.store_manager.dto.tour.TourResponseDto;
import com.example.store_manager.mapper.TourMapper;
import com.example.store_manager.model.Shop;
import com.example.store_manager.model.Tour;
import com.example.store_manager.model.TourImage;
import com.example.store_manager.repository.ShopRepository;
import com.example.store_manager.repository.TourRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TourService {

    private final TourRepository tourRepository;
    private final TourMapper tourMapper;
    private final ShopRepository shopRepository;

    public TourResponseDto createTour(TourCreateDto dto, Principal principal) {
        Shop shop = shopRepository.findById(dto.getShopId())
                .orElseThrow(() -> new RuntimeException("Shop not found"));

        Tour tour = tourMapper.toEntity(dto);
        tour.setShop(shop);
        tour.setMadeBy(principal.getName());

        return tourMapper.toDto(tourRepository.save(tour));
    }

    @Transactional
    public TourResponseDto updateTour(Long id, TourCreateDto dto) {
        Tour tour = tourRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tour not found"));

        // ✅ Update basic fields using the mapper (title, description, price, etc.)
        tourMapper.updateTourFromDto(dto, tour);

        // ✅ Handle image updates (replace old images with new ones)
        if (dto.getImages() != null) {
            // 1️⃣ Clear old images
            tour.getImages().clear();

            // 2️⃣ Add new images
            for (String imageUrl : dto.getImages()) {
                TourImage img = new TourImage();
                img.setImageUrl(imageUrl);
                img.setTour(tour);
                tour.getImages().add(img);
            }
        }

        // ✅ Save & return updated data
        Tour updated = tourRepository.save(tour);
        return tourMapper.toDto(updated);
    }

    // ✅ fetch all (no pagination)
    public List<TourResponseDto> getAllTours() {
        return tourRepository.findAll()
                .stream()
                .map(tourMapper::toDto)
                .toList();
    }

    // ✅ new: fetch with filters + pagination
    public Page<TourResponseDto> getAllByQuery(String category,
            String type,
            String language,
            int page,
            int size,
            String[] sort) {
        Sort sortSpec = Sort.by(
                Sort.Direction.fromString(sort[1]),
                sort[0]);
        Pageable pageable = PageRequest.of(page, size, sortSpec);

        Page<Tour> tours = tourRepository.findByFilters(category, type, language, pageable);
        return tours.map(tourMapper::toDto);
    }

    public TourResponseDto getTourById(Long id) {
        Tour tour = tourRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tour not found"));
        return tourMapper.toDto(tour);
    }

    public List<TourResponseDto> getToursByShopId(Long shopId) {
        return tourRepository.findByShopId(shopId)
                .stream()
                .map(tourMapper::toDto)
                .toList();
    }

    public List<TourResponseDto> getRandomTours(int count) {
        return tourRepository.findRandomActiveTours(count).stream()
                .map(tourMapper::toDto)
                .collect(Collectors.toList());
    }

    public TourResponseDto getHighlightedTour() {
        return tourRepository.findRandomActiveTour()
                .map(tourMapper::toDto)
                .orElseThrow(() -> new RuntimeException("No active tours found"));
    }
}