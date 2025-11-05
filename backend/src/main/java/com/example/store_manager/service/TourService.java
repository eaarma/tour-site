package com.example.store_manager.service;

import java.security.Principal;
import java.util.Arrays;
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
import com.example.store_manager.model.TourCategory;
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

        // Update simple fields
        tourMapper.updateTourFromDto(dto, tour);

        // Reattach categories safely (prevent null crash)
        if (dto.getCategories() != null) {
            tour.setCategories(dto.getCategories());
        }

        return tourMapper.toDto(tourRepository.save(tour));
    }

    // ✅ fetch all (no pagination)
    public List<TourResponseDto> getAllTours() {
        return tourRepository.findAll()
                .stream()
                .map(tourMapper::toDto)
                .toList();
    }

    public Page<TourResponseDto> getAllByQuery(
            List<String> categories, // <-- now a list, not string
            String type,
            String language,
            int page,
            int size,
            String[] sort) {

        Sort sortSpec = Sort.by(Sort.Direction.fromString(sort[1]), sort[0]);
        Pageable pageable = PageRequest.of(page, size, sortSpec);

        // Convert List<String> to List<TourCategory> (Enum)
        List<TourCategory> categoryEnums = null;
        if (categories != null && !categories.isEmpty()) {
            categoryEnums = categories.stream()
                    .map(String::trim)
                    .map(String::toUpperCase)
                    .map(TourCategory::valueOf)
                    .toList();
        }

        Page<Tour> tours = tourRepository.findByFilters(categoryEnums, type, language, pageable);
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