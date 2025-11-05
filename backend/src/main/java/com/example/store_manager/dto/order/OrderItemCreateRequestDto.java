package com.example.store_manager.dto.order;

import java.time.LocalDateTime;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemCreateRequestDto {
    @NotNull(message = "Tour ID must not be null")
    private Long tourId;

    @NotNull(message = "Schedule ID must not be null")
    private Long scheduleId;

    @NotNull(message = "Tour date and time are required")
    private LocalDateTime scheduledAt;

    @NotNull(message = "Number of participants is required")
    @Min(value = 1, message = "At least one participant is required")
    private Integer participants;
}