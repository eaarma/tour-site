package com.example.store_manager.dto.schedule;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TourScheduleResponseDto {

    private Long id;
    private Long tourId;
    private LocalDate date;
    private LocalTime time;
    private int maxParticipants;
    private int bookedParticipants;
    private int reservedParticipants;
    private String status; // e.g. ACTIVE, EXPIRED, BOOKED
}