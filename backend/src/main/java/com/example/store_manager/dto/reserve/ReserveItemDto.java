package com.example.store_manager.dto.reserve;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReserveItemDto {

    @NotNull
    private Long scheduleId;

    @Min(1)
    private Integer participants;
}
