package com.example.store_manager.service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.store_manager.dto.schedule.TourScheduleCreateDto;
import com.example.store_manager.dto.schedule.TourScheduleResponseDto;
import com.example.store_manager.dto.schedule.TourScheduleUpdateDto;
import com.example.store_manager.mapper.TourScheduleMapper;
import com.example.store_manager.model.Tour;
import com.example.store_manager.model.TourSchedule;
import com.example.store_manager.repository.TourRepository;
import com.example.store_manager.repository.TourScheduleRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TourScheduleService {

    private final TourScheduleRepository scheduleRepository;
    private final TourRepository tourRepository;
    private final TourScheduleMapper scheduleMapper;

    public TourScheduleResponseDto createSchedule(TourScheduleCreateDto dto) {
        Tour tour = tourRepository.findById(dto.getTourId())
                .orElseThrow(() -> new RuntimeException("Tour not found"));

        TourSchedule schedule = scheduleMapper.fromCreateDto(dto, tour);
        schedule = scheduleRepository.save(schedule);

        return scheduleMapper.toDto(schedule);
    }

    public List<TourScheduleResponseDto> getAllSchedulesForTour(Long tourId) {
        return scheduleRepository.findByTourId(tourId).stream()
                .map(scheduleMapper::toDto)
                .collect(Collectors.toList());
    }

    public List<TourScheduleResponseDto> getSchedulesForTour(Long tourId) {
        return scheduleRepository.findByTourIdAndStatus(tourId, "ACTIVE")
                .stream()
                .map(scheduleMapper::toDto)
                .collect(Collectors.toList());
    }

    public TourScheduleResponseDto getScheduleById(Long id) {
        TourSchedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Schedule not found"));
        return scheduleMapper.toDto(schedule);
    }

    public TourScheduleResponseDto updateSchedule(Long id, TourScheduleUpdateDto dto) {
        TourSchedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Schedule not found"));

        if (dto.getDate() != null)
            schedule.setDate(dto.getDate());
        if (dto.getTime() != null)
            schedule.setTime(dto.getTime());
        if (dto.getMaxParticipants() != null)
            schedule.setMaxParticipants(dto.getMaxParticipants());
        if (dto.getBookedParticipants() != null)
            schedule.setBookedParticipants(dto.getBookedParticipants());

        // Auto-update status logic:
        int booked = schedule.getBookedParticipants();
        if (booked >= schedule.getMaxParticipants()) {
            schedule.setStatus("BOOKED");
        } else {
            schedule.setStatus("ACTIVE");
        }

        // Optional: mark expired dates
        if (schedule.getDate().isBefore(LocalDate.now())) {
            schedule.setStatus("EXPIRED");
        }

        scheduleRepository.save(schedule);
        return scheduleMapper.toDto(schedule);
    }

    public void deleteSchedule(Long id) {
        if (!scheduleRepository.existsById(id)) {
            throw new RuntimeException("Schedule not found");
        }
        scheduleRepository.deleteById(id);
    }
}