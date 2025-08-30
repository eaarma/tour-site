package com.example.store_manager.dto.schedule;

import java.time.LocalDate;
import java.time.LocalTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TourScheduleResponseDto {

    private Long id;
    private Long tourId;
    private String date;
    private String time;
    private int maxParticipants;
    private int remainingParticipants;
}