package com.tourhub.storefront.dto;

import com.tourhub.storefront.model.HomepageValueIconKey;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HomepageValueCardDto {

    @Size(max = 180)
    private String title;

    @Size(max = 500)
    private String description;

    @NotNull
    private HomepageValueIconKey iconKey;
}
