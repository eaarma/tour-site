package com.example.store_manager.service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
import com.example.store_manager.security.annotations.AccessLevel;
import com.example.store_manager.security.annotations.ShopAccess;
import com.example.store_manager.security.annotations.ShopIdSource;
import com.example.store_manager.utility.ApiError;
import com.example.store_manager.utility.Result;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TourScheduleService {

    private final TourScheduleRepository scheduleRepository;
    private final TourRepository tourRepository;
    private final TourScheduleMapper scheduleMapper;
    private final TourSessionMapper sessionMapper;
    private final TourSessionRepository sessionRepository;

    @Transactional(readOnly = true)
    public Result<List<TourScheduleResponseDto>> getAllSchedulesForTour(Long tourId) {

        List<TourScheduleResponseDto> schedules = scheduleRepository.findByTourId(tourId)
                .stream()
                .map(scheduleMapper::toDto)
                .toList();

        return Result.ok(schedules);
    }

    @Transactional(readOnly = true)
    public Result<List<TourScheduleResponseDto>> getSchedulesForTour(Long tourId) {

        List<TourScheduleResponseDto> schedules = scheduleRepository.findByTourIdAndStatus(tourId, "ACTIVE")
                .stream()
                .map(scheduleMapper::toDto)
                .toList();

        return Result.ok(schedules);
    }

    @Transactional(readOnly = true)
    public Result<TourScheduleResponseDto> getScheduleById(Long id) {

        return scheduleRepository.findById(id)
                .map(scheduleMapper::toDto)
                .map(Result::ok)
                .orElseGet(() -> Result.fail(ApiError.notFound("Schedule not found")));
    }

    @Transactional
    @ShopAccess(value = AccessLevel.GUIDE, source = ShopIdSource.DTO_TOUR_ID)
    public Result<TourScheduleResponseDto> createSchedule(TourScheduleCreateDto dto) {

        Tour tour = tourRepository.findById(dto.getTourId())
                .orElse(null);

        if (tour == null) {
            return Result.fail(ApiError.notFound("Tour not found"));
        }

        TourSchedule schedule = scheduleMapper.fromCreateDto(dto, tour);
        TourSchedule savedSchedule = scheduleRepository.save(schedule);

        // ⭐ Automatically create matching session
        TourSession session = sessionMapper.fromSchedule(savedSchedule);
        sessionRepository.save(session);

        return Result.ok(scheduleMapper.toDto(savedSchedule));
    }

    @Transactional
    @ShopAccess(value = AccessLevel.GUIDE, source = ShopIdSource.ITEM_ID)
    public Result<TourScheduleResponseDto> updateSchedule(
            Long id,
            TourScheduleUpdateDto dto) {

        TourSchedule schedule = scheduleRepository.findById(id)
                .orElse(null);

        if (schedule == null) {
            return Result.fail(ApiError.notFound("Schedule not found"));
        }

        if (dto.getDate() != null)
            schedule.setDate(dto.getDate());
        if (dto.getTime() != null)
            schedule.setTime(dto.getTime());
        if (dto.getMaxParticipants() != null)
            schedule.setMaxParticipants(dto.getMaxParticipants());
        if (dto.getBookedParticipants() != null)
            schedule.setBookedParticipants(dto.getBookedParticipants());

        // Auto-update status logic
        int booked = schedule.getBookedParticipants();
        if (booked >= schedule.getMaxParticipants()) {
            schedule.setStatus("BOOKED");
        } else {
            schedule.setStatus("ACTIVE");
        }

        // Expired overrides everything
        if (schedule.getDate().isBefore(LocalDate.now())) {
            schedule.setStatus("EXPIRED");
        }

        scheduleRepository.save(schedule);
        return Result.ok(scheduleMapper.toDto(schedule));
    }

    @Transactional
    @ShopAccess(value = AccessLevel.GUIDE, source = ShopIdSource.ITEM_ID)
    public Result<Boolean> deleteSchedule(Long id) {

        if (!scheduleRepository.existsById(id)) {
            return Result.fail(ApiError.notFound("Schedule not found"));
        }

        scheduleRepository.deleteById(id);
        return Result.ok(true);
    }
}
