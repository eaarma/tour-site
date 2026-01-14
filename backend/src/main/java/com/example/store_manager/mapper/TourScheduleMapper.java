package com.example.store_manager.mapper;

import org.springframework.stereotype.Component;
import com.example.store_manager.dto.schedule.TourScheduleCreateDto;
import com.example.store_manager.dto.schedule.TourScheduleResponseDto;
import com.example.store_manager.model.Tour;
import com.example.store_manager.model.TourSchedule;

@Component
public class TourScheduleMapper {

    public TourScheduleResponseDto toDto(TourSchedule schedule) {
        return TourScheduleResponseDto.builder()
                .id(schedule.getId())
                .tourId(schedule.getTour().getId())
                .date(schedule.getDate())
                .time(schedule.getTime())
                .maxParticipants(schedule.getMaxParticipants())
                .bookedParticipants(
                        schedule.getBookedParticipants() == null ? 0 : schedule.getBookedParticipants())
                .status(schedule.getStatus())
                .build();
    }

    public TourSchedule fromCreateDto(TourScheduleCreateDto dto, Tour tour) {
        TourSchedule schedule = new TourSchedule();
        schedule.setTour(tour);
        schedule.setDate(dto.getDate());
        schedule.setTime(dto.getTime());
        schedule.setMaxParticipants(dto.getMaxParticipants());
        schedule.setBookedParticipants(0); // keep explicit
        schedule.setStatus("ACTIVE");
        return schedule;
    }
}
