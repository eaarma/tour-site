package com.example.store_manager.service;

import java.security.Principal;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.store_manager.dto.tour.TourCreateDto;
import com.example.store_manager.dto.tour.TourResponseDto;
import com.example.store_manager.mapper.TourMapper;
import com.example.store_manager.model.Shop;
import com.example.store_manager.model.Tour;
import com.example.store_manager.model.TourCategory;
import com.example.store_manager.model.TourImage;
import com.example.store_manager.repository.ShopRepository;
import com.example.store_manager.repository.TourRepository;
import com.example.store_manager.security.annotations.AccessLevel;
import com.example.store_manager.security.annotations.ShopAccess;
import com.example.store_manager.utility.ApiError;
import com.example.store_manager.utility.Result;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TourService {

    private final TourRepository tourRepository;
    private final TourMapper tourMapper;
    private final ShopRepository shopRepository;

    @Transactional
    @ShopAccess(AccessLevel.MANAGER)
    public Result<TourResponseDto> createTour(
            Long shopId,
            TourCreateDto dto,
            Principal principal) {

        Shop shop = shopRepository.findById(dto.getShopId())
                .orElse(null);

        if (shop == null) {
            return Result.fail(ApiError.notFound("Shop not found"));
        }

        Tour tour = tourMapper.toEntity(dto);
        tour.setShop(shop);
        tour.setMadeBy(principal.getName());

        Tour saved = tourRepository.save(tour);
        return Result.ok(tourMapper.toDto(saved));
    }

    @Transactional
    @ShopAccess(AccessLevel.MANAGER)
    public Result<TourResponseDto> updateTour(Long tourId, TourCreateDto dto) {

        Tour tour = tourRepository.findById(tourId)
                .orElse(null);

        if (tour == null) {
            return Result.fail(ApiError.notFound("Tour not found"));
        }

        // Update simple fields
        tourMapper.updateTourFromDto(dto, tour);

        // Reattach categories safely
        if (dto.getCategories() != null) {
            tour.setCategories(dto.getCategories());
        }

        Tour saved = tourRepository.save(tour);
        return Result.ok(tourMapper.toDto(saved));
    }

    @Transactional(readOnly = true)
    public Result<List<TourResponseDto>> getAllTours() {

        List<TourResponseDto> tours = tourRepository.findAll()
                .stream()
                .map(tourMapper::toDto)
                .toList();

        return Result.ok(tours);
    }

    @Transactional(readOnly = true)
    public Result<Page<TourResponseDto>> getAllByQuery(
            List<String> categories,
            String type,
            List<String> language,
            String keyword,
            String date,
            int page,
            int size,
            String[] sort) {

        Sort sortSpec = Sort.by(
                Sort.Direction.fromString(sort[1]),
                sort[0]);

        Pageable pageable = PageRequest.of(page, size, sortSpec);

        if (keyword != null && keyword.isBlank())
            keyword = null;
        if (date != null && date.isBlank())
            date = null;

        List<TourCategory> categoryEnums = null;
        if (categories != null && !categories.isEmpty()) {
            try {
                categoryEnums = categories.stream()
                        .map(String::toUpperCase)
                        .map(TourCategory::valueOf)
                        .toList();
            } catch (IllegalArgumentException ex) {
                return Result.fail(ApiError.badRequest("Invalid category"));
            }
        }

        Page<Tour> tours = tourRepository.searchByFilters(
                categoryEnums,
                type,
                language,
                keyword,
                date,
                pageable);

        return Result.ok(tours.map(tourMapper::toDto));
    }

    @Transactional(readOnly = true)
    public Result<TourResponseDto> getTourById(Long id) {

        return tourRepository.findById(id)
                .map(tourMapper::toDto)
                .map(Result::ok)
                .orElseGet(() -> Result.fail(ApiError.notFound("Tour not found")));
    }

    @Transactional(readOnly = true)
    public Result<List<TourResponseDto>> getToursByShopId(Long shopId) {

        List<TourResponseDto> tours = tourRepository.findByShopId(shopId)
                .stream()
                .map(tourMapper::toDto)
                .toList();

        return Result.ok(tours);
    }

    @Transactional(readOnly = true)
    public Result<List<TourResponseDto>> getRandomTours(int count) {

        List<TourResponseDto> tours = tourRepository
                .findRandomActiveTours(count)
                .stream()
                .map(tourMapper::toDto)
                .toList();

        return Result.ok(tours);
    }

    @Transactional(readOnly = true)
    public Result<TourResponseDto> getHighlightedTour() {

        return tourRepository.findRandomActiveTour()
                .map(tourMapper::toDto)
                .map(Result::ok)
                .orElseGet(() -> Result.fail(ApiError.notFound("No active tours found")));
    }
}
