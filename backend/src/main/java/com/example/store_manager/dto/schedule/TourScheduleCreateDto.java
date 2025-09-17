package com.example.store_manager.dto.schedule;

import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TourScheduleCreateDto {

    @NotNull(message = "Tour ID is required")
    private Long tourId;

    @NotNull(message = "Date is required")
    private LocalDate date;

    private LocalTime time; // optional

    @Min(value = 1, message = "At least 1 participant is required")
    private int maxParticipants;
}