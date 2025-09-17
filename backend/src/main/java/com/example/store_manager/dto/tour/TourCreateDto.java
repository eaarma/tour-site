package com.example.store_manager.dto.tour;

import java.math.BigDecimal;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TourCreateDto {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    @Size(min = 10, message = "Description must be at least 10 characters")
    private String description;

    @NotBlank(message = "Image URL is required")
    private String image;

    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be positive")
    private BigDecimal price;

    @NotNull(message = "Time required (minutes) is required")
    private Integer timeRequired;

    @NotBlank(message = "Intensity is required")
    private String intensity;

    @Min(value = 1, message = "At least 1 participant is required")
    private int participants;

    @NotBlank(message = "Category is required")
    private String category;

    @NotBlank(message = "Language is required")
    private String language;

    @NotBlank(message = "Type is required")
    private String type;

    @NotBlank(message = "Location is required")
    private String location;

    @NotBlank(message = "Status is required")
    private String status;

    @NotNull(message = "Shop ID is required")
    private Long shopId;
}