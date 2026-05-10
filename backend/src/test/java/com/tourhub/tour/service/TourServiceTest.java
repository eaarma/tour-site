package com.tourhub.tour.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import java.security.Principal;
import java.time.LocalDate;
import java.math.BigDecimal;
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
import com.tourhub.tour.dto.TourCreateDto;
import com.tourhub.tour.dto.TourResponseDto;
import com.tourhub.tour.dto.TourUpdateDto;
import com.tourhub.tour.mapper.TourMapper;
import com.tourhub.shop.model.Shop;
import com.tourhub.tour.model.Tour;
import com.tourhub.tour.model.TourCategory;
import com.tourhub.shop.repository.ShopRepository;
import com.tourhub.tour.repository.TourRepository;
import com.tourhub.common.result.Result;

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
        TourUpdateDto dto = new TourUpdateDto();
        dto.setTitle("Updated Tour");
        dto.setDescription("Updated description");
        dto.setPrice(BigDecimal.valueOf(49.99));
        dto.setTimeRequired(120);
        dto.setIntensity("MEDIUM");
        dto.setParticipants(10);
        dto.setLanguage(Set.of("EN"));
        dto.setMeetingPoint("Square");
        dto.setType("WALKING");
        dto.setLocation("Tallinn");
        dto.setStatus("ACTIVE");
        dto.setCategories(Set.of(TourCategory.ADVENTURE));

        Tour tour = new Tour();
        TourResponseDto responseDto = new TourResponseDto();

        when(tourRepository.findById(1L)).thenReturn(Optional.of(tour));
        doAnswer(invocation -> {
            TourUpdateDto source = invocation.getArgument(0);
            Tour target = invocation.getArgument(1);
            target.setCategories(source.getCategories());
            return null;
        }).when(tourMapper).updateTourFromDto(dto, tour);
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

        Result<TourResponseDto> result = tourService.updateTour(99L, new TourUpdateDto());

        assertTrue(result.isFail());
        assertEquals("NOT_FOUND", result.error().code());
        assertEquals("Tour not found", result.error().message());
    }

    @Test
    void searchToursForAdmin_returnsOkPage() {
        Tour tour = new Tour();
        TourResponseDto dto = new TourResponseDto();
        Page<Tour> page = new PageImpl<>(List.of(tour));

        when(tourRepository.searchAdminTours(eq("tour"), eq("ACTIVE"), any(Pageable.class)))
                .thenReturn(page);
        when(tourMapper.toDto(tour)).thenReturn(dto);

        Result<Page<TourResponseDto>> result = tourService.searchToursForAdmin(
                "tour",
                "ACTIVE",
                0,
                10);

        assertTrue(result.isOk());
        assertEquals(1, result.get().getContent().size());
        verify(tourRepository).searchAdminTours(eq("tour"), eq("ACTIVE"), any(Pageable.class));
    }

    @Test
    void searchToursForAdmin_returnsFail_whenInvalidStatus() {
        Result<Page<TourResponseDto>> result = tourService.searchToursForAdmin(
                "tour",
                "INVALID",
                0,
                10);

        assertTrue(result.isFail());
        assertEquals("BAD_REQUEST", result.error().code());
        assertEquals("Invalid tour status", result.error().message());
    }

    @Test
    void updateTourStatus_returnsOk_whenValid() {
        Tour tour = new Tour();
        tour.setStatus("ACTIVE");
        TourResponseDto dto = new TourResponseDto();
        dto.setStatus("CANCELLED");

        when(tourRepository.findById(1L)).thenReturn(Optional.of(tour));
        when(tourRepository.save(tour)).thenReturn(tour);
        when(tourMapper.toDto(tour)).thenReturn(dto);

        Result<TourResponseDto> result = tourService.updateTourStatus(1L, "cancelled");

        assertTrue(result.isOk());
        assertEquals("CANCELLED", tour.getStatus());
        verify(tourRepository).save(tour);
    }

    @Test
    void updateTourStatus_returnsFail_whenInvalidStatus() {
        Tour tour = new Tour();
        tour.setStatus("ACTIVE");

        when(tourRepository.findById(1L)).thenReturn(Optional.of(tour));

        Result<TourResponseDto> result = tourService.updateTourStatus(1L, "invalid");

        assertTrue(result.isFail());
        assertEquals("BAD_REQUEST", result.error().code());
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

        when(tourRepository.searchWithCategory(
                any(), any(), any(), any(), any(Pageable.class)))
                .thenReturn(page);

        when(tourMapper.toDto(tour)).thenReturn(dto);

        Result<Page<TourResponseDto>> result = tourService.getAllByQuery(
                List.of("ADVENTURE"),
                List.of("PRIVATE"),
                List.of("EN"),
                null,
                null, // hasDate = false
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
                List.of("PRIVATE"),
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

