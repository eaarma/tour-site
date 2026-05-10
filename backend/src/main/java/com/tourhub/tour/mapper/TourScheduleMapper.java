package com.tourhub.tour.mapper;

import org.springframework.stereotype.Component;
import com.tourhub.tour.dto.TourScheduleCreateDto;
import com.tourhub.tour.dto.TourScheduleResponseDto;
import com.tourhub.tour.model.Tour;
import com.tourhub.tour.model.TourSchedule;

@Component
public class TourScheduleMapper {

    public TourScheduleResponseDto toDto(TourSchedule schedule) {
        return TourScheduleResponseDto.builder()
                .id(schedule.getId())
                .tourId(schedule.getTour().getId())
                .date(schedule.getDate())
                .time(schedule.getTime())
                .tourTitle(schedule.getTour().getTitle())
                .maxParticipants(schedule.getMaxParticipants())
                .bookedParticipants(
                        schedule.getBookedParticipants() == null ? 0 : schedule.getBookedParticipants())
                .reservedParticipants(
                        schedule.getReservedParticipants() == null ? 0 : schedule.getReservedParticipants())
                .status(schedule.getStatus())
                .build();
    }

    public TourSchedule fromCreateDto(TourScheduleCreateDto dto, Tour tour) {
        TourSchedule schedule = new TourSchedule();
        schedule.setTour(tour);
        schedule.setDate(dto.getDate());
        schedule.setTime(dto.getTime());
        schedule.setBookedParticipants(0); // keep explicit
        schedule.setReservedParticipants(0); // initialize reserved participants
        schedule.setStatus("ACTIVE");
        return schedule;
    }
}
