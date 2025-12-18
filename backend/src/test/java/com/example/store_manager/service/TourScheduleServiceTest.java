package com.example.store_manager.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.store_manager.dto.schedule.TourScheduleCreateDto;
import com.example.store_manager.dto.schedule.TourScheduleResponseDto;
import com.example.store_manager.dto.schedule.TourScheduleUpdateDto;
import com.example.store_manager.mapper.TourScheduleMapper;
import com.example.store_manager.mapper.TourSessionMapper;
import com.example.store_manager.model.Tour;
import com.example.store_manager.model.TourSchedule;
import com.example.store_manager.model.TourSession;
import com.example.store_manager.repository.TourRepository;
import com.example.store_manager.repository.TourScheduleRepository;
import com.example.store_manager.repository.TourSessionRepository;
import com.example.store_manager.utility.Result;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@ExtendWith(MockitoExtension.class)
class TourScheduleServiceTest {

    @Mock
    private TourScheduleRepository scheduleRepository;

    @Mock
    private TourRepository tourRepository;

    @Mock
    private TourScheduleMapper scheduleMapper;

    @Mock
    private TourSessionMapper sessionMapper;

    @Mock
    private TourSessionRepository sessionRepository;

    @InjectMocks
    private TourScheduleService service;

    @Test
    void getAllSchedulesForTour_returnsOkList() {
        TourSchedule schedule = new TourSchedule();
        TourScheduleResponseDto dto = new TourScheduleResponseDto();

        when(scheduleRepository.findByTourId(1L)).thenReturn(List.of(schedule));
        when(scheduleMapper.toDto(schedule)).thenReturn(dto);

        Result<List<TourScheduleResponseDto>> result = service.getAllSchedulesForTour(1L);

        assertTrue(result.isOk());
        assertEquals(1, result.get().size());
        assertSame(dto, result.get().get(0));
    }

    @Test
    void getSchedulesForTour_returnsOnlyActiveSchedules() {
        TourSchedule schedule = new TourSchedule();
        TourScheduleResponseDto dto = new TourScheduleResponseDto();

        when(scheduleRepository.findByTourIdAndStatus(1L, "ACTIVE"))
                .thenReturn(List.of(schedule));
        when(scheduleMapper.toDto(schedule)).thenReturn(dto);

        Result<List<TourScheduleResponseDto>> result = service.getSchedulesForTour(1L);

        assertTrue(result.isOk());
        assertEquals(1, result.get().size());
    }

    @Test
    void getScheduleById_returnsOk_whenFound() {
        TourSchedule schedule = new TourSchedule();
        TourScheduleResponseDto dto = new TourScheduleResponseDto();

        when(scheduleRepository.findById(1L))
                .thenReturn(Optional.of(schedule));
        when(scheduleMapper.toDto(schedule)).thenReturn(dto);

        Result<TourScheduleResponseDto> result = service.getScheduleById(1L);

        assertTrue(result.isOk());
        assertSame(dto, result.get());
    }

    @Test
    void getScheduleById_returnsFail_whenNotFound() {
        when(scheduleRepository.findById(1L))
                .thenReturn(Optional.empty());

        Result<TourScheduleResponseDto> result = service.getScheduleById(1L);

        assertTrue(result.isFail());
        assertEquals("NOT_FOUND", result.error().code());
        assertEquals("Schedule not found", result.error().message());
    }

    @Test
    void createSchedule_returnsOk_andCreatesSession() {
        TourScheduleCreateDto dto = new TourScheduleCreateDto();
        dto.setTourId(1L);

        Tour tour = new Tour();
        TourSchedule schedule = new TourSchedule();
        TourSession session = new TourSession();
        TourScheduleResponseDto responseDto = new TourScheduleResponseDto();

        when(tourRepository.findById(1L)).thenReturn(Optional.of(tour));
        when(scheduleMapper.fromCreateDto(dto, tour)).thenReturn(schedule);
        when(scheduleRepository.save(schedule)).thenReturn(schedule);
        when(sessionMapper.fromSchedule(schedule)).thenReturn(session);
        when(scheduleMapper.toDto(schedule)).thenReturn(responseDto);

        Result<TourScheduleResponseDto> result = service.createSchedule(dto);

        assertTrue(result.isOk());
        assertSame(responseDto, result.get());
        verify(sessionRepository).save(session);
    }

    @Test
    void createSchedule_returnsFail_whenTourNotFound() {
        TourScheduleCreateDto dto = new TourScheduleCreateDto();
        dto.setTourId(1L);

        when(tourRepository.findById(1L)).thenReturn(Optional.empty());

        Result<TourScheduleResponseDto> result = service.createSchedule(dto);

        assertTrue(result.isFail());
        assertEquals("NOT_FOUND", result.error().code());
        assertEquals("Tour not found", result.error().message());
    }

    @Test
    void updateSchedule_setsBooked_whenFull() {
        TourSchedule schedule = new TourSchedule();
        schedule.setMaxParticipants(5);
        schedule.setBookedParticipants(5);
        schedule.setDate(LocalDate.now().plusDays(1));

        TourScheduleUpdateDto dto = new TourScheduleUpdateDto();
        dto.setBookedParticipants(5);

        when(scheduleRepository.findById(1L))
                .thenReturn(Optional.of(schedule));
        when(scheduleMapper.toDto(schedule))
                .thenReturn(new TourScheduleResponseDto());

        Result<TourScheduleResponseDto> result = service.updateSchedule(1L, dto);

        assertTrue(result.isOk());
        assertEquals("BOOKED", schedule.getStatus());
        verify(scheduleRepository).save(schedule);
    }

    @Test
    void updateSchedule_setsExpired_whenDateInPast() {
        TourSchedule schedule = new TourSchedule();
        schedule.setMaxParticipants(10);
        schedule.setBookedParticipants(1);
        schedule.setDate(LocalDate.now().minusDays(1));

        TourScheduleUpdateDto dto = new TourScheduleUpdateDto();

        when(scheduleRepository.findById(1L))
                .thenReturn(Optional.of(schedule));
        when(scheduleMapper.toDto(schedule))
                .thenReturn(new TourScheduleResponseDto());

        Result<TourScheduleResponseDto> result = service.updateSchedule(1L, dto);

        assertTrue(result.isOk());
        assertEquals("EXPIRED", schedule.getStatus());
    }

    @Test
    void updateSchedule_returnsFail_whenNotFound() {
        when(scheduleRepository.findById(1L))
                .thenReturn(Optional.empty());

        Result<TourScheduleResponseDto> result = service.updateSchedule(1L, new TourScheduleUpdateDto());

        assertTrue(result.isFail());
        assertEquals("NOT_FOUND", result.error().code());
        assertEquals("Schedule not found", result.error().message());
    }

    @Test
    void deleteSchedule_returnsOk_whenExists() {
        when(scheduleRepository.existsById(1L)).thenReturn(true);

        Result<Boolean> result = service.deleteSchedule(1L);

        assertTrue(result.isOk());
        assertTrue(result.get());
        verify(scheduleRepository).deleteById(1L);
    }

    @Test
    void deleteSchedule_returnsFail_whenNotFound() {
        when(scheduleRepository.existsById(1L)).thenReturn(false);

        Result<Boolean> result = service.deleteSchedule(1L);

        assertTrue(result.isFail());
        assertEquals("NOT_FOUND", result.error().code());
        assertEquals("Schedule not found", result.error().message());
    }
}
