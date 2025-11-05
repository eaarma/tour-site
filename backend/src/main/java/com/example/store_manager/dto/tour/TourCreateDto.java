package com.example.store_manager.dto.tour;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

import com.example.store_manager.model.TourCategory;

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

    private List<String> images;

    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be positive")
    private BigDecimal price;

    @NotNull(message = "Time required (minutes) is required")
    private Integer timeRequired;

    @NotBlank(message = "Intensity is required")
    private String intensity;

    @Min(value = 1, message = "At least 1 participant is required")
    private int participants;

    @NotEmpty(message = "At least one category required")
    private Set<TourCategory> categories;

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