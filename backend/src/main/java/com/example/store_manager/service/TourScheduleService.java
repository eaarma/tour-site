package com.example.store_manager.service;

import com.example.store_manager.model.Tour;
import com.example.store_manager.model.TourSchedule;
import com.example.store_manager.repository.TourRepository;
import com.example.store_manager.repository.TourScheduleRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

import com.example.store_manager.dto.schedule.TourScheduleCreateDto;
import com.example.store_manager.dto.schedule.TourScheduleResponseDto;
import com.example.store_manager.dto.schedule.TourScheduleUpdateDto;

@Service
@RequiredArgsConstructor
public class TourScheduleService {

    private final TourScheduleRepository scheduleRepository;
    private final TourRepository tourRepository;

    public TourScheduleResponseDto createSchedule(TourScheduleCreateDto dto) {
        Tour tour = tourRepository.findById(dto.getTourId())
                .orElseThrow(() -> new RuntimeException("Tour not found"));

        TourSchedule schedule = TourSchedule.builder()
                .tour(tour)
                .date(dto.getDate())
                .time(dto.getTime())
                .maxParticipants(dto.getMaxParticipants())
                .build();

        schedule = scheduleRepository.save(schedule);
        return mapToDto(schedule);
    }

    public List<TourScheduleResponseDto> getSchedulesForTour(Long tourId) {
        return scheduleRepository.findByTourId(tourId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public TourScheduleResponseDto updateSchedule(Long id, TourScheduleUpdateDto dto) {
        TourSchedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Schedule not found"));

        if (dto.getDate() != null) {
            schedule.setDate(dto.getDate());
        }
        if (dto.getTime() != null) {
            schedule.setTime(dto.getTime());
        }
        if (dto.getMaxParticipants() != null) {
            schedule.setMaxParticipants(dto.getMaxParticipants());
        }

        schedule = scheduleRepository.save(schedule);
        return mapToDto(schedule);
    }

    public void deleteSchedule(Long id) {
        if (!scheduleRepository.existsById(id)) {
            throw new RuntimeException("Schedule not found");
        }
        scheduleRepository.deleteById(id);
    }

    private TourScheduleResponseDto mapToDto(TourSchedule schedule) {
        return TourScheduleResponseDto.builder()
                .id(schedule.getId())
                .date(schedule.getDate().toString())
                .time(schedule.getTime().toString())
                .maxParticipants(schedule.getMaxParticipants())
                .tourId(schedule.getTour().getId())
                .build();
    }
}