package com.tourhub.storefront.dto;

import java.util.List;

import com.tourhub.storefront.model.HomepageHeroContentPosition;
import com.tourhub.storefront.model.HomepageHeroTextColorMode;
import com.tourhub.storefront.model.HomepageSelectionMode;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
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
public class UpdateHomepageConfigRequestDto {

    @NotNull
    private Boolean heroEnabled;

    @Size(max = 255)
    private String heroTitle;

    @Size(max = 1000)
    private String heroSubtitle;

    @Size(max = 120)
    private String heroButtonText;

    @Size(max = 500)
    private String heroButtonLink;

    @NotNull
    private HomepageHeroContentPosition heroContentPosition;

    @Size(max = 500)
    private String heroImageUrl;

    @NotNull
    private HomepageHeroTextColorMode heroTextColorMode;

    @Size(max = 20)
    private String heroCustomTextColor;

    @NotNull
    @Min(0)
    @Max(100)
    private Integer heroOverlayStrength;

    @NotNull
    private Boolean featuredEnabled;

    @Size(max = 255)
    private String featuredTitle;

    @NotNull
    private HomepageSelectionMode featuredSelectionMode;

    @NotNull
    @Size(max = 24)
    private List<Long> featuredTourIds;

    @NotNull
    @Min(1)
    @Max(24)
    private Integer featuredMaxItems;

    @NotNull
    private Boolean highlightedEnabled;

    @Size(max = 255)
    private String highlightedTitle;

    @NotNull
    private HomepageSelectionMode highlightedSelectionMode;

    @NotNull
    @Size(max = 24)
    private List<Long> highlightedTourIds;

    @NotNull
    private Boolean collectionEnabled;

    @Size(max = 255)
    private String collectionTitle;

    @NotNull
    @Valid
    @Size(min = 4, max = 4)
    private List<HomepageCollectionBlockDto> collectionBlocks;

    @NotNull
    private Boolean valueSectionEnabled;

    @Size(max = 120)
    private String valueEyebrow;

    @Size(max = 255)
    private String valueTitle;

    @Size(max = 1000)
    private String valueDescription;

    @NotNull
    @Valid
    @Size(max = 4)
    private List<HomepageValueCardDto> valueCards;

    @NotNull
    private Boolean aboutEnabled;

    @Size(max = 120)
    private String aboutEyebrow;

    @Size(max = 255)
    private String aboutTitle;

    @Size(max = 1000)
    private String aboutDescription;

    @Size(max = 120)
    private String aboutButtonText;

    @NotNull
    private Boolean ctaEnabled;

    @Size(max = 255)
    private String ctaTitle;

    @Size(max = 1000)
    private String ctaDescription;
}
