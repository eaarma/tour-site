package com.example.store_manager.dto.schedule;

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
    private String date;

    private String time; // optional

    @Min(value = 1, message = "At least 1 participant is required")
    private int maxParticipants;
}