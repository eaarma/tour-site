package com.example.store_manager.dto.reserve;

import java.util.List;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReserveRequestDto {

    @NotEmpty
    private List<ReserveItemDto> items;
}
