package com.tourhub.tour.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tourhub.tour.dto.TourScheduleCreateDto;
import com.tourhub.tour.dto.TourScheduleResponseDto;
import com.tourhub.tour.dto.TourScheduleUpdateDto;
import com.tourhub.tour.mapper.TourScheduleMapper;
import com.tourhub.tour.model.Tour;
import com.tourhub.tour.model.TourSchedule;
import com.tourhub.tour.repository.TourRepository;
import com.tourhub.tour.repository.TourScheduleRepository;
import com.tourhub.security.annotations.AccessLevel;
import com.tourhub.security.annotations.ShopAccess;
import com.tourhub.security.annotations.ShopIdSource;
import com.tourhub.common.result.ApiError;
import com.tourhub.common.result.Result;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TourScheduleService {

    private final TourScheduleRepository scheduleRepository;
    private final TourRepository tourRepository;
    private final TourScheduleMapper scheduleMapper;

    @Transactional(readOnly = true)
    public Result<List<TourScheduleResponseDto>> getAllSchedulesForTour(Long tourId) {

        return Result.ok(
                scheduleRepository.findByTourId(tourId)
                        .stream()
                        .map(scheduleMapper::toDto)
                        .toList());
    }

    @Transactional(readOnly = true)
    public Result<List<TourScheduleResponseDto>> getSchedulesForTour(Long tourId) {

        return Result.ok(
                scheduleRepository.findByTourIdAndStatus(tourId, "ACTIVE")
                        .stream()
                        .map(scheduleMapper::toDto)
                        .toList());
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
        schedule.setMaxParticipants(tour.getParticipants());
        schedule.setBookedParticipants(0);
        schedule.setStatus("ACTIVE");

        TourSchedule saved = scheduleRepository.save(schedule);
        return Result.ok(scheduleMapper.toDto(saved));
    }

    @Transactional
    @ShopAccess(value = AccessLevel.GUIDE, source = ShopIdSource.SCHEDULE_ID)
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

        // Derive the status instead of setting bookedParticipants manually.
        if (schedule.getDate().isBefore(LocalDate.now())) {
            schedule.setStatus("EXPIRED");
        } else if (schedule.getBookedParticipants() >= schedule.getMaxParticipants()) {
            schedule.setStatus("BOOKED");
        } else {
            schedule.setStatus("ACTIVE");
        }

        scheduleRepository.save(schedule);
        return Result.ok(scheduleMapper.toDto(schedule));
    }

    @Transactional
    @ShopAccess(value = AccessLevel.GUIDE, source = ShopIdSource.SCHEDULE_ID)
    public Result<Boolean> deleteSchedule(Long id) {

        if (!scheduleRepository.existsById(id)) {
            return Result.fail(ApiError.notFound("Schedule not found"));
        }

        scheduleRepository.deleteById(id);
        return Result.ok(true);
    }

    @Transactional(readOnly = true)
    @ShopAccess(value = AccessLevel.GUIDE, source = ShopIdSource.SHOP_ID)
    public Result<List<TourScheduleResponseDto>> getSchedulesForShop(Long shopId) {

        return Result.ok(
                scheduleRepository.findByShopIdOrderByDateAndTime(shopId)
                        .stream()
                        .map(scheduleMapper::toDto)
                        .toList());
    }
}


