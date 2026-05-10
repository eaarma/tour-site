package com.tourhub.tour.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;

@Data
public class TourImageRequestDto {
    @NotBlank(message = "imageUrl is required")
    private String imageUrl;

}
