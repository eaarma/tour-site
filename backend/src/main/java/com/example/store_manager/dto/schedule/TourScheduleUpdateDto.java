package com.example.store_manager.dto.schedule;

import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TourScheduleUpdateDto {

    private String date; // ISO date string, e.g., "2025-09-01"

    private String time; // ISO time string, e.g., "14:00"

    @Min(value = 1, message = "Maximum participants must be at least 1")
    private Integer maxParticipants; // optional
}