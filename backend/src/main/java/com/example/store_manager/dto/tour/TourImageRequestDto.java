package com.example.store_manager.dto.tour;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;

@Data
public class TourImageRequestDto {
    @NotBlank(message = "imageUrl is required")
    private String imageUrl;

}
