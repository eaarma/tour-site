package com.example.store_manager.controller;

import com.example.store_manager.service.TourScheduleService;
import com.example.store_manager.utility.ResultResponseMapper;

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
    public ResponseEntity<?> create(
            @Valid @RequestBody TourScheduleCreateDto dto) {

        return ResultResponseMapper.toResponse(
                service.createSchedule(dto));
    }

    @GetMapping("/tour/{tourId}")
    public ResponseEntity<?> getSchedulesForTour(
            @PathVariable Long tourId) {

        return ResultResponseMapper.toResponse(
                service.getSchedulesForTour(tourId));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<?> update(
            @PathVariable Long id,
            @Valid @RequestBody TourScheduleUpdateDto dto) {

        return ResultResponseMapper.toResponse(
                service.updateSchedule(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {

        return ResultResponseMapper.toResponse(
                service.deleteSchedule(id));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {

        return ResultResponseMapper.toResponse(
                service.getScheduleById(id));
    }
}
