package com.tourhub.tour.service;

import java.security.Principal;
import java.time.LocalDate;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tourhub.tour.dto.TourCreateDto;
import com.tourhub.tour.dto.TourResponseDto;
import com.tourhub.tour.dto.TourUpdateDto;
import com.tourhub.tour.mapper.TourMapper;
import com.tourhub.tour.model.Tour;
import com.tourhub.tour.model.TourCategory;
import com.tourhub.shop.model.Shop;
import com.tourhub.shop.repository.ShopRepository;
import com.tourhub.tour.repository.TourRepository;
import com.tourhub.security.annotations.AccessLevel;
import com.tourhub.security.annotations.ShopAccess;
import com.tourhub.common.result.ApiError;
import com.tourhub.common.result.Result;
import com.tourhub.security.annotations.ShopIdSource;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TourService {

    private static final Set<String> ADMIN_TOUR_STATUSES = Set.of(
            "ACTIVE",
            "ON_HOLD",
            "CANCELLED");

    private final TourRepository tourRepository;
    private final TourMapper tourMapper;
    private final ShopRepository shopRepository;

    @Transactional
    @ShopAccess(value = AccessLevel.GUIDE, source = ShopIdSource.SHOP_ID)
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
    @ShopAccess(value = AccessLevel.GUIDE, source = ShopIdSource.TOUR_ID)
    public Result<TourResponseDto> updateTour(Long tourId, TourUpdateDto dto) {

        Tour tour = tourRepository.findById(tourId)
                .orElse(null);

        if (tour == null) {
            return Result.fail(ApiError.notFound("Tour not found"));
        }

        tourMapper.updateTourFromDto(dto, tour);

        Tour saved = tourRepository.save(tour);
        return Result.ok(tourMapper.toDto(saved));
    }

    @Transactional(readOnly = true)
    public Result<Page<TourResponseDto>> searchToursForAdmin(
            String query,
            String status,
            int page,
            int size) {

        String normalizedQuery = normalizeQuery(query);
        String normalizedStatus = normalizeStatus(status);

        if (status != null && !status.isBlank() && normalizedStatus == null) {
            return Result.fail(ApiError.badRequest("Invalid tour status"));
        }

        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by("id").descending());

        Page<Tour> result = tourRepository.searchAdminTours(
                normalizedQuery,
                normalizedStatus,
                pageable);

        return Result.ok(result.map(tourMapper::toDto));
    }

    @Transactional
    public Result<TourResponseDto> updateTourStatus(Long tourId, String status) {

        Tour tour = tourRepository.findById(tourId)
                .orElse(null);

        if (tour == null) {
            return Result.fail(ApiError.notFound("Tour not found"));
        }

        String normalizedStatus = normalizeStatus(status);

        if (normalizedStatus == null) {
            return Result.fail(ApiError.badRequest("Invalid tour status"));
        }

        if (normalizedStatus.equals(tour.getStatus())) {
            return Result.ok(tourMapper.toDto(tour));
        }

        tour.setStatus(normalizedStatus);
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
            List<String> type, List<String> language,
            String keyword,
            LocalDate date,
            int page,
            int size,
            String[] sort) {

        Sort sortSpec = Sort.by(
                Sort.Direction.fromString(sort[1]),
                sort[0]);

        Pageable pageable = PageRequest.of(page, size, sortSpec);

        if (keyword != null && keyword.isBlank())
            keyword = null;

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

        boolean hasCategory = categoryEnums != null && !categoryEnums.isEmpty();
        boolean hasDate = date != null;

        Page<Tour> tours;

        if (type != null && type.isEmpty()) {
            type = null;
        }

        if (hasCategory && hasDate) {
            tours = tourRepository.searchWithCategoryAndDate(
                    categoryEnums,
                    type,
                    language,
                    keyword,
                    date,
                    pageable);

        } else if (hasCategory) {
            tours = tourRepository.searchWithCategory(
                    categoryEnums,
                    type,
                    language,
                    keyword,
                    pageable);

        } else if (hasDate) {
            tours = tourRepository.searchWithDate(
                    type,
                    language,
                    keyword,
                    date,
                    pageable);

        } else {
            tours = tourRepository.searchBase(
                    type,
                    language,
                    keyword,
                    pageable);
        }

        return Result.ok(tours.map(tourMapper::toDto));
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
    public Result<List<TourResponseDto>> getRandomToursByCategory(String category, int count) {

        TourCategory categoryEnum;

        try {
            categoryEnum = TourCategory.valueOf(category.toUpperCase());
        } catch (IllegalArgumentException ex) {
            return Result.fail(ApiError.badRequest("Invalid category"));
        }

        List<TourResponseDto> tours = tourRepository
                .findRandomActiveToursByCategory(categoryEnum.name(), count)
                .stream()
                .map(tourMapper::toDto)
                .toList();

        return Result.ok(tours);
    }

    private String normalizeQuery(String query) {
        if (query == null || query.isBlank()) {
            return null;
        }

        return query.trim();
    }

    private String normalizeStatus(String status) {
        if (status == null || status.isBlank()) {
            return null;
        }

        String normalized = status.trim().toUpperCase(Locale.ROOT);
        return ADMIN_TOUR_STATUSES.contains(normalized) ? normalized : null;
    }

}


