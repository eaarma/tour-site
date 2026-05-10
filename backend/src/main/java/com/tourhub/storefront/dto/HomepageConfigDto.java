package com.tourhub.storefront.dto;

import java.util.List;

import com.tourhub.storefront.model.HomepageHeroContentPosition;
import com.tourhub.storefront.model.HomepageHeroTextColorMode;
import com.tourhub.storefront.model.HomepageSelectionMode;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HomepageConfigDto {

    private Long id;
    private Boolean heroEnabled;
    private String heroTitle;
    private String heroSubtitle;
    private String heroButtonText;
    private String heroButtonLink;
    private HomepageHeroContentPosition heroContentPosition;
    private String heroImageUrl;
    private HomepageHeroTextColorMode heroTextColorMode;
    private String heroCustomTextColor;
    private Integer heroOverlayStrength;
    private Boolean featuredEnabled;
    private String featuredTitle;
    private HomepageSelectionMode featuredSelectionMode;
    private List<Long> featuredTourIds;
    private Integer featuredMaxItems;
    private Boolean highlightedEnabled;
    private String highlightedTitle;
    private HomepageSelectionMode highlightedSelectionMode;
    private List<Long> highlightedTourIds;
    private Boolean collectionEnabled;
    private String collectionTitle;
    private List<HomepageCollectionBlockDto> collectionBlocks;
    private Boolean valueSectionEnabled;
    private String valueEyebrow;
    private String valueTitle;
    private String valueDescription;
    private List<HomepageValueCardDto> valueCards;
    private Boolean aboutEnabled;
    private String aboutEyebrow;
    private String aboutTitle;
    private String aboutDescription;
    private String aboutButtonText;
    private Boolean ctaEnabled;
    private String ctaTitle;
    private String ctaDescription;
    private String createdAt;
    private String updatedAt;
}
