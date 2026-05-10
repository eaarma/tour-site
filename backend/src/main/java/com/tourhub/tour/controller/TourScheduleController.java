package com.tourhub.tour.controller;

import com.tourhub.tour.service.TourScheduleService;
import com.tourhub.common.result.ResultResponseMapper;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

import com.tourhub.tour.dto.TourScheduleCreateDto;
import com.tourhub.tour.dto.TourScheduleUpdateDto;

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
                        @PathVariable("tourId") Long tourId) {

                return ResultResponseMapper.toResponse(
                                service.getSchedulesForTour(tourId));
        }

        @PatchMapping("/{id}")
        public ResponseEntity<?> update(
                        @PathVariable("id") Long id,
                        @Valid @RequestBody TourScheduleUpdateDto dto) {

                return ResultResponseMapper.toResponse(
                                service.updateSchedule(id, dto));
        }

        @DeleteMapping("/{id}")
        public ResponseEntity<?> delete(@PathVariable("id") Long id) {

                return ResultResponseMapper.toResponse(
                                service.deleteSchedule(id));
        }

        @GetMapping("/{id}")
        public ResponseEntity<?> getById(@PathVariable("id") Long id) {

                return ResultResponseMapper.toResponse(
                                service.getScheduleById(id));
        }

        @GetMapping("/shop/{shopId}")
        public ResponseEntity<?> getSchedulesForShop(
                        @PathVariable("shopId") Long shopId) {

                return ResultResponseMapper.toResponse(
                                service.getSchedulesForShop(shopId));
        }
}

