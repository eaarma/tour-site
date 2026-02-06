package com.example.store_manager.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import java.security.Principal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import com.example.store_manager.dto.tour.TourCreateDto;
import com.example.store_manager.dto.tour.TourResponseDto;
import com.example.store_manager.mapper.TourMapper;
import com.example.store_manager.model.Shop;
import com.example.store_manager.model.Tour;
import com.example.store_manager.model.TourCategory;
import com.example.store_manager.repository.ShopRepository;
import com.example.store_manager.repository.TourRepository;
import com.example.store_manager.utility.Result;

@ExtendWith(MockitoExtension.class)
class TourServiceTest {

    @Mock
    private TourRepository tourRepository;

    @Mock
    private TourMapper tourMapper;

    @Mock
    private ShopRepository shopRepository;

    @InjectMocks
    private TourService tourService;

    @Test
    void createTour_returnsOk_whenValid() {
        TourCreateDto dto = new TourCreateDto();
        dto.setShopId(1L);

        Shop shop = new Shop();
        Tour tour = new Tour();
        TourResponseDto responseDto = new TourResponseDto();

        Principal principal = () -> "test-user";

        when(shopRepository.findById(1L)).thenReturn(Optional.of(shop));
        when(tourMapper.toEntity(dto)).thenReturn(tour);
        when(tourRepository.save(tour)).thenReturn(tour);
        when(tourMapper.toDto(tour)).thenReturn(responseDto);

        Result<TourResponseDto> result = tourService.createTour(1L, dto, principal);

        assertTrue(result.isOk());
        assertSame(responseDto, result.get());
        assertEquals("test-user", tour.getMadeBy());
        assertEquals(shop, tour.getShop());
    }

    @Test
    void createTour_returnsFail_whenShopNotFound() {
        TourCreateDto dto = new TourCreateDto();
        dto.setShopId(1L);

        when(shopRepository.findById(1L)).thenReturn(Optional.empty());

        Result<TourResponseDto> result = tourService.createTour(1L, dto, () -> "user");

        assertTrue(result.isFail());
        assertEquals("NOT_FOUND", result.error().code());
        assertEquals("Shop not found", result.error().message());
    }

    @Test
    void updateTour_returnsOk_whenValid() {
        TourCreateDto dto = new TourCreateDto();
        dto.setCategories(Set.of(TourCategory.ADVENTURE));

        Tour tour = new Tour();
        TourResponseDto responseDto = new TourResponseDto();

        when(tourRepository.findById(1L)).thenReturn(Optional.of(tour));
        when(tourRepository.save(tour)).thenReturn(tour);
        when(tourMapper.toDto(tour)).thenReturn(responseDto);

        Result<TourResponseDto> result = tourService.updateTour(1L, dto);

        assertTrue(result.isOk());
        assertSame(responseDto, result.get());
        assertEquals(dto.getCategories(), tour.getCategories());
        verify(tourMapper).updateTourFromDto(dto, tour);
    }

    @Test
    void updateTour_returnsFail_whenTourNotFound() {
        when(tourRepository.findById(99L)).thenReturn(Optional.empty());

        Result<TourResponseDto> result = tourService.updateTour(99L, new TourCreateDto());

        assertTrue(result.isFail());
        assertEquals("NOT_FOUND", result.error().code());
        assertEquals("Tour not found", result.error().message());
    }

    @Test
    void getAllTours_returnsOkList() {
        Tour tour = new Tour();
        TourResponseDto dto = new TourResponseDto();

        when(tourRepository.findAll()).thenReturn(List.of(tour));
        when(tourMapper.toDto(tour)).thenReturn(dto);

        Result<List<TourResponseDto>> result = tourService.getAllTours();

        assertTrue(result.isOk());
        assertEquals(1, result.get().size());
        assertSame(dto, result.get().get(0));
    }

    @Test
    void getAllTours_returnsEmptyOkList() {
        when(tourRepository.findAll()).thenReturn(List.of());

        Result<List<TourResponseDto>> result = tourService.getAllTours();

        assertTrue(result.isOk());
        assertTrue(result.get().isEmpty());
    }

    @Test
    void getAllByQuery_returnsOkPage() {
        Tour tour = new Tour();
        TourResponseDto dto = new TourResponseDto();

        Page<Tour> page = new PageImpl<>(List.of(tour));

        when(tourRepository.searchByFiltersWithoutDate(
                any(), any(), any(), any(), any(Pageable.class)))
                .thenReturn(page);

        when(tourMapper.toDto(tour)).thenReturn(dto);

        Result<Page<TourResponseDto>> result = tourService.getAllByQuery(
                List.of("ADVENTURE"),
                "PRIVATE",
                List.of("EN"),
                null,
                null, // date = null → WITHOUT date branch
                0,
                10,
                new String[] { "title", "asc" });

        assertTrue(result.isOk());
        assertEquals(1, result.get().getContent().size());
        assertSame(dto, result.get().getContent().get(0));
    }

    @Test
    void getAllByQuery_returnsFail_whenInvalidCategory() {
        Result<Page<TourResponseDto>> result = tourService.getAllByQuery(
                List.of("INVALID"),
                null,
                null,
                null,
                null,
                0,
                10,
                new String[] { "title", "asc" });

        assertTrue(result.isFail());
        assertEquals("BAD_REQUEST", result.error().code());
    }

    @Test
    void getAllByQuery_withCategoryAndDate_callsCorrectRepository() {
        Tour tour = new Tour();
        TourResponseDto dto = new TourResponseDto();

        Page<Tour> page = new PageImpl<>(List.of(tour));

        LocalDate date = LocalDate.of(2026, 2, 28);

        when(tourRepository.searchWithCategoryAndDate(
                any(),
                any(),
                any(),
                any(),
                eq(date),
                any(Pageable.class)))
                .thenReturn(page);

        when(tourMapper.toDto(tour)).thenReturn(dto);

        Result<Page<TourResponseDto>> result = tourService.getAllByQuery(
                List.of("ADVENTURE"),
                "PRIVATE",
                List.of("EN"),
                null,
                date,
                0,
                10,
                new String[] { "title", "asc" });

        assertTrue(result.isOk());
        assertEquals(1, result.get().getContent().size());
        assertSame(dto, result.get().getContent().get(0));

        verify(tourRepository).searchWithCategoryAndDate(
                any(),
                any(),
                any(),
                any(),
                eq(date),
                any(Pageable.class));
    }

    @Test
    void getTourById_returnsOk_whenFound() {
        Tour tour = new Tour();
        TourResponseDto dto = new TourResponseDto();

        when(tourRepository.findById(1L)).thenReturn(Optional.of(tour));
        when(tourMapper.toDto(tour)).thenReturn(dto);

        Result<TourResponseDto> result = tourService.getTourById(1L);

        assertTrue(result.isOk());
        assertSame(dto, result.get());
    }

    @Test
    void getTourById_returnsFail_whenNotFound() {
        when(tourRepository.findById(1L)).thenReturn(Optional.empty());

        Result<TourResponseDto> result = tourService.getTourById(1L);

        assertTrue(result.isFail());
        assertEquals("NOT_FOUND", result.error().code());
    }

    @Test
    void getToursByShopId_returnsOkList() {
        Tour tour = new Tour();
        TourResponseDto dto = new TourResponseDto();

        when(tourRepository.findByShopId(1L)).thenReturn(List.of(tour));
        when(tourMapper.toDto(tour)).thenReturn(dto);

        Result<List<TourResponseDto>> result = tourService.getToursByShopId(1L);

        assertTrue(result.isOk());
        assertEquals(1, result.get().size());
    }

    @Test
    void getRandomTours_returnsOkList() {
        Tour tour = new Tour();
        TourResponseDto dto = new TourResponseDto();

        when(tourRepository.findRandomActiveTours(5))
                .thenReturn(List.of(tour));
        when(tourMapper.toDto(tour)).thenReturn(dto);

        Result<List<TourResponseDto>> result = tourService.getRandomTours(5);

        assertTrue(result.isOk());
        assertEquals(1, result.get().size());
        assertSame(dto, result.get().get(0));
    }

    @Test
    void getHighlightedTour_returnsOk_whenExists() {
        Tour tour = new Tour();
        TourResponseDto dto = new TourResponseDto();

        when(tourRepository.findRandomActiveTour())
                .thenReturn(Optional.of(tour));
        when(tourMapper.toDto(tour)).thenReturn(dto);

        Result<TourResponseDto> result = tourService.getHighlightedTour();

        assertTrue(result.isOk());
        assertSame(dto, result.get());
    }

    @Test
    void getHighlightedTour_returnsFail_whenNoneExist() {
        when(tourRepository.findRandomActiveTour())
                .thenReturn(Optional.empty());

        Result<TourResponseDto> result = tourService.getHighlightedTour();

        assertTrue(result.isFail());
        assertEquals("NOT_FOUND", result.error().code());
        assertEquals("No active tours found", result.error().message());
    }

}
