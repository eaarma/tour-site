package com.tourhub.storefront.dto;

import com.tourhub.tour.model.TourCategory;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HomepageCollectionBlockDto {

    @Size(max = 120)
    private String badge;

    @Size(max = 180)
    private String title;

    @Size(max = 500)
    private String description;

    private TourCategory category;

    private Long tourId;
}
