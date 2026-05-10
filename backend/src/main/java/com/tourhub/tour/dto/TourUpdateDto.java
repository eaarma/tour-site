package com.tourhub.tour.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

import com.tourhub.tour.model.TourCategory;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TourUpdateDto {
    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    private List<String> images;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be positive")
    private BigDecimal price;

    @NotNull(message = "Time required (minutes) is required")
    private Integer timeRequired;

    @NotNull(message = "Participants is required")
    @Min(value = 1, message = "At least 1 participant is required")
    private Integer participants;

    @NotBlank(message = "Meeting point required")
    private String meetingPoint;

    @NotBlank(message = "Intensity is required")
    private String intensity;

    @NotBlank(message = "Type is required")
    private String type;

    @NotEmpty(message = "Language is required")
    private Set<String> language;

    @NotBlank(message = "Location is required")
    private String location;

    @NotBlank(message = "Status is required")
    private String status;

    @NotEmpty(message = "At least one category required")
    private Set<TourCategory> categories;

    private Long shopId;
}
