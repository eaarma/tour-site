package com.example.store_manager.controller;

import com.example.store_manager.service.TourScheduleService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

import java.util.List;

import com.example.store_manager.dto.schedule.TourScheduleCreateDto;
import com.example.store_manager.dto.schedule.TourScheduleResponseDto;
import com.example.store_manager.dto.schedule.TourScheduleUpdateDto;

@RestController
@RequestMapping("/schedules")
@RequiredArgsConstructor
public class TourScheduleController {

    private final TourScheduleService service;

    @PostMapping
    public ResponseEntity<TourScheduleResponseDto> create(@Valid @RequestBody TourScheduleCreateDto dto) {
        return ResponseEntity.ok(service.createSchedule(dto));
    }

    @GetMapping("/tour/{tourId}")
    public ResponseEntity<List<TourScheduleResponseDto>> getSchedulesForTour(@PathVariable Long tourId) {
        return ResponseEntity.ok(service.getSchedulesForTour(tourId));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<TourScheduleResponseDto> update(@PathVariable Long id,
            @Valid @RequestBody TourScheduleUpdateDto dto) {
        return ResponseEntity.ok(service.updateSchedule(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteSchedule(id);
        return ResponseEntity.noContent().build();
    }
}