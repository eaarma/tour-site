package com.tourhub.storefront.service;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tourhub.tour.repository.TourRepository;
import com.tourhub.common.result.ApiError;
import com.tourhub.common.result.Result;
import com.tourhub.storefront.dto.HomepageCollectionBlockDto;
import com.tourhub.storefront.dto.HomepageConfigDto;
import com.tourhub.storefront.dto.HomepageValueCardDto;
import com.tourhub.storefront.dto.UpdateHomepageConfigRequestDto;
import com.tourhub.storefront.model.HomepageConfig;
import com.tourhub.storefront.model.HomepageHeroContentPosition;
import com.tourhub.storefront.model.HomepageHeroTextColorMode;
import com.tourhub.storefront.model.HomepageSelectionMode;
import com.tourhub.storefront.model.HomepageValueIconKey;
import com.tourhub.storefront.repository.HomepageConfigRepository;
import com.tourhub.tour.model.TourCategory;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class HomepageConfigService {

    private static final TypeReference<List<Long>> LONG_LIST_TYPE = new TypeReference<>() {
    };

    private static final TypeReference<List<HomepageCollectionBlockDto>> COLLECTION_BLOCK_LIST_TYPE = new TypeReference<>() {
    };

    private static final TypeReference<List<HomepageValueCardDto>> VALUE_CARD_LIST_TYPE = new TypeReference<>() {
    };

    private static final String ACTIVE_STATUS = "ACTIVE";
    private static final String DEFAULT_HERO_TITLE = "Find your adventure";
    private static final String DEFAULT_HERO_SUBTITLE = "Guided tours shaped for easier browsing, clearer details, and faster decisions";
    private static final String DEFAULT_HERO_BUTTON_TEXT = "Browse all tours";
    private static final String DEFAULT_HERO_BUTTON_LINK = "/items";
    private static final String DEFAULT_HERO_IMAGE_URL = "/images/welcome_image.png";
    private static final String DEFAULT_FEATURED_TITLE = "Featured tours";
    private static final String DEFAULT_HIGHLIGHTED_TITLE = "Tour spotlight";
    private static final String DEFAULT_COLLECTION_TITLE = "Explore by style";
    private static final String DEFAULT_VALUE_EYEBROW = "Why book here";
    private static final String DEFAULT_VALUE_TITLE = "A homepage built to make comparing tours feel quicker and more considered";
    private static final String DEFAULT_VALUE_DESCRIPTION = "The homepage is designed to surface the details that matter early, so it is easier to compare routes, pacing, group format, and booking fit before you commit.";
    private static final String DEFAULT_ABOUT_EYEBROW = "About the platform";
    private static final String DEFAULT_ABOUT_TITLE = "Tour discovery designed to feel clearer from the first click";
    private static final String DEFAULT_ABOUT_DESCRIPTION = "From quick city walks to longer outdoor routes, the goal is to make it easier to understand each experience, compare options, and move into booking with confidence.";
    private static final String DEFAULT_ABOUT_BUTTON_TEXT = "Explore tours";
    private static final String DEFAULT_CTA_TITLE = "Ready to find the right tour or ask a question before you book?";
    private static final String DEFAULT_CTA_DESCRIPTION = "Keep browsing the tour catalog, or head to the contact page if you want help choosing a route, comparing options, or planning a trip.";

    private final HomepageConfigRepository homepageConfigRepository;
    private final TourRepository tourRepository;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public Result<HomepageConfigDto> getHomepageConfig() {
        HomepageConfigDto config = homepageConfigRepository.findTopByOrderByIdAsc()
                .map(this::toDto)
                .orElseGet(() -> toDto(buildDefaultConfig()));

        return Result.ok(config);
    }

    @Transactional
    public Result<HomepageConfigDto> updateHomepageConfig(UpdateHomepageConfigRequestDto dto) {
        Result<Void> validationResult = validate(dto);

        if (validationResult.isFail()) {
            return Result.fail(validationResult.getErrorOrThrow());
        }

        HomepageConfig config = homepageConfigRepository.findTopByOrderByIdAsc()
                .orElseGet(this::buildDefaultConfig);

        applyUpdate(dto, config);

        HomepageConfig savedConfig = homepageConfigRepository.save(config);
        return Result.ok(toDto(savedConfig));
    }

    private HomepageConfigDto toDto(HomepageConfig config) {
        return HomepageConfigDto.builder()
                .id(config.getId())
                .heroEnabled(config.getHeroEnabled())
                .heroTitle(config.getHeroTitle())
                .heroSubtitle(config.getHeroSubtitle())
                .heroButtonText(config.getHeroButtonText())
                .heroButtonLink(config.getHeroButtonLink())
                .heroContentPosition(config.getHeroContentPosition())
                .heroImageUrl(config.getHeroImageUrl())
                .heroTextColorMode(config.getHeroTextColorMode())
                .heroCustomTextColor(config.getHeroCustomTextColor())
                .heroOverlayStrength(config.getHeroOverlayStrength())
                .featuredEnabled(config.getFeaturedEnabled())
                .featuredTitle(config.getFeaturedTitle())
                .featuredSelectionMode(config.getFeaturedSelectionMode())
                .featuredTourIds(readLongList(config.getFeaturedTourIdsJson()))
                .featuredMaxItems(config.getFeaturedMaxItems())
                .highlightedEnabled(config.getHighlightedEnabled())
                .highlightedTitle(config.getHighlightedTitle())
                .highlightedSelectionMode(config.getHighlightedSelectionMode())
                .highlightedTourIds(readLongList(config.getHighlightedTourIdsJson()))
                .collectionEnabled(config.getCollectionEnabled())
                .collectionTitle(config.getCollectionTitle())
                .collectionBlocks(readCollectionBlocks(config.getCollectionBlocksJson()))
                .valueSectionEnabled(config.getValueSectionEnabled())
                .valueEyebrow(config.getValueEyebrow())
                .valueTitle(config.getValueTitle())
                .valueDescription(config.getValueDescription())
                .valueCards(readValueCards(config.getValueCardsJson()))
                .aboutEnabled(config.getAboutEnabled())
                .aboutEyebrow(config.getAboutEyebrow())
                .aboutTitle(config.getAboutTitle())
                .aboutDescription(config.getAboutDescription())
                .aboutButtonText(config.getAboutButtonText())
                .ctaEnabled(config.getCtaEnabled())
                .ctaTitle(config.getCtaTitle())
                .ctaDescription(config.getCtaDescription())
                .createdAt(config.getCreatedAt() != null ? config.getCreatedAt().toString() : null)
                .updatedAt(config.getUpdatedAt() != null ? config.getUpdatedAt().toString() : null)
                .build();
    }

    private HomepageConfig buildDefaultConfig() {
        return HomepageConfig.builder()
                .heroEnabled(Boolean.TRUE)
                .heroTitle(DEFAULT_HERO_TITLE)
                .heroSubtitle(DEFAULT_HERO_SUBTITLE)
                .heroButtonText(DEFAULT_HERO_BUTTON_TEXT)
                .heroButtonLink(DEFAULT_HERO_BUTTON_LINK)
                .heroContentPosition(HomepageHeroContentPosition.LEFT)
                .heroImageUrl(DEFAULT_HERO_IMAGE_URL)
                .heroTextColorMode(HomepageHeroTextColorMode.AUTO)
                .heroOverlayStrength(42)
                .featuredEnabled(Boolean.TRUE)
                .featuredTitle(DEFAULT_FEATURED_TITLE)
                .featuredSelectionMode(HomepageSelectionMode.RANDOM)
                .featuredTourIdsJson(writeJson(List.of()))
                .featuredMaxItems(8)
                .highlightedEnabled(Boolean.TRUE)
                .highlightedTitle(DEFAULT_HIGHLIGHTED_TITLE)
                .highlightedSelectionMode(HomepageSelectionMode.RANDOM)
                .highlightedTourIdsJson(writeJson(List.of()))
                .collectionEnabled(Boolean.TRUE)
                .collectionTitle(DEFAULT_COLLECTION_TITLE)
                .collectionBlocksJson(writeJson(defaultCollectionBlocks()))
                .valueSectionEnabled(Boolean.TRUE)
                .valueEyebrow(DEFAULT_VALUE_EYEBROW)
                .valueTitle(DEFAULT_VALUE_TITLE)
                .valueDescription(DEFAULT_VALUE_DESCRIPTION)
                .valueCardsJson(writeJson(defaultValueCards()))
                .aboutEnabled(Boolean.TRUE)
                .aboutEyebrow(DEFAULT_ABOUT_EYEBROW)
                .aboutTitle(DEFAULT_ABOUT_TITLE)
                .aboutDescription(DEFAULT_ABOUT_DESCRIPTION)
                .aboutButtonText(DEFAULT_ABOUT_BUTTON_TEXT)
                .ctaEnabled(Boolean.TRUE)
                .ctaTitle(DEFAULT_CTA_TITLE)
                .ctaDescription(DEFAULT_CTA_DESCRIPTION)
                .build();
    }

    private void applyUpdate(UpdateHomepageConfigRequestDto dto, HomepageConfig config) {
        config.setHeroEnabled(dto.getHeroEnabled());
        config.setHeroTitle(normalizeNullable(dto.getHeroTitle()));
        config.setHeroSubtitle(normalizeNullable(dto.getHeroSubtitle()));
        config.setHeroButtonText(normalizeNullable(dto.getHeroButtonText()));
        config.setHeroButtonLink(normalizeNullable(dto.getHeroButtonLink()));
        config.setHeroContentPosition(dto.getHeroContentPosition());
        config.setHeroImageUrl(normalizeNullable(dto.getHeroImageUrl()));
        config.setHeroTextColorMode(dto.getHeroTextColorMode());
        config.setHeroCustomTextColor(normalizeCustomTextColor(dto));
        config.setHeroOverlayStrength(dto.getHeroOverlayStrength());

        config.setFeaturedEnabled(dto.getFeaturedEnabled());
        config.setFeaturedTitle(normalizeNullable(dto.getFeaturedTitle()));
        config.setFeaturedSelectionMode(dto.getFeaturedSelectionMode());
        config.setFeaturedTourIdsJson(writeJson(normalizeTourIds(dto.getFeaturedTourIds())));
        config.setFeaturedMaxItems(dto.getFeaturedMaxItems());

        config.setHighlightedEnabled(dto.getHighlightedEnabled());
        config.setHighlightedTitle(normalizeNullable(dto.getHighlightedTitle()));
        config.setHighlightedSelectionMode(dto.getHighlightedSelectionMode());
        config.setHighlightedTourIdsJson(writeJson(normalizeTourIds(dto.getHighlightedTourIds())));

        config.setCollectionEnabled(dto.getCollectionEnabled());
        config.setCollectionTitle(normalizeNullable(dto.getCollectionTitle()));
        config.setCollectionBlocksJson(writeJson(normalizeCollectionBlocks(dto.getCollectionBlocks())));

        config.setValueSectionEnabled(dto.getValueSectionEnabled());
        config.setValueEyebrow(normalizeNullable(dto.getValueEyebrow()));
        config.setValueTitle(normalizeNullable(dto.getValueTitle()));
        config.setValueDescription(normalizeNullable(dto.getValueDescription()));
        config.setValueCardsJson(writeJson(normalizeValueCards(dto.getValueCards())));

        config.setAboutEnabled(dto.getAboutEnabled());
        config.setAboutEyebrow(normalizeNullable(dto.getAboutEyebrow()));
        config.setAboutTitle(normalizeNullable(dto.getAboutTitle()));
        config.setAboutDescription(normalizeNullable(dto.getAboutDescription()));
        config.setAboutButtonText(normalizeNullable(dto.getAboutButtonText()));

        config.setCtaEnabled(dto.getCtaEnabled());
        config.setCtaTitle(normalizeNullable(dto.getCtaTitle()));
        config.setCtaDescription(normalizeNullable(dto.getCtaDescription()));
    }

    private Result<Void> validate(UpdateHomepageConfigRequestDto dto) {
        if (dto.getHeroTextColorMode() == HomepageHeroTextColorMode.CUSTOM) {
            String customColor = normalizeNullable(dto.getHeroCustomTextColor());

            if (customColor == null || !isValidHexColor(customColor)) {
                return Result.fail(ApiError.badRequest("Hero custom text color must be a valid 6-digit hex color."));
            }
        }

        String heroButtonLink = normalizeNullable(dto.getHeroButtonLink());
        if (heroButtonLink != null && !isValidUrlOrPath(heroButtonLink)) {
            return Result.fail(ApiError.badRequest("Hero button link must be an absolute URL or a site-relative path."));
        }

        Result<Void> featuredValidationResult = validateActiveTours(
                normalizeTourIds(dto.getFeaturedTourIds()),
                "featured tours");

        if (featuredValidationResult.isFail()) {
            return Result.fail(featuredValidationResult.getErrorOrThrow());
        }

        Result<Void> highlightedValidationResult = validateActiveTours(
                normalizeTourIds(dto.getHighlightedTourIds()),
                "highlighted tours");

        if (highlightedValidationResult.isFail()) {
            return Result.fail(highlightedValidationResult.getErrorOrThrow());
        }

        List<Long> collectionTourIds = dto.getCollectionBlocks().stream()
                .map(HomepageCollectionBlockDto::getTourId)
                .filter(id -> id != null && id > 0)
                .toList();

        Result<Void> collectionValidationResult = validateActiveTours(collectionTourIds, "collection block tours");

        if (collectionValidationResult.isFail()) {
            return Result.fail(collectionValidationResult.getErrorOrThrow());
        }

        return Result.ok();
    }

    private Result<Void> validateActiveTours(List<Long> tourIds, String fieldLabel) {
        if (tourIds.isEmpty()) {
            return Result.ok();
        }

        long activeTourCount = tourRepository.countDistinctActiveToursByIds(tourIds);

        if (activeTourCount != new LinkedHashSet<>(tourIds).size()) {
            return Result.fail(ApiError.badRequest("Some selected " + fieldLabel + " are missing or no longer active."));
        }

        return Result.ok();
    }

    private List<Long> normalizeTourIds(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return List.of();
        }

        Set<Long> normalizedIds = new LinkedHashSet<>();

        for (Long id : ids) {
            if (id != null && id > 0) {
                normalizedIds.add(id);
            }
        }

        return List.copyOf(normalizedIds);
    }

    private List<HomepageCollectionBlockDto> normalizeCollectionBlocks(List<HomepageCollectionBlockDto> blocks) {
        if (blocks == null || blocks.isEmpty()) {
            return defaultCollectionBlocks();
        }

        List<HomepageCollectionBlockDto> normalizedBlocks = new ArrayList<>();

        for (HomepageCollectionBlockDto block : blocks) {
            TourCategory category = block != null ? block.getCategory() : null;
            Long tourId = block != null ? block.getTourId() : null;

            normalizedBlocks.add(HomepageCollectionBlockDto.builder()
                    .badge(normalizeNullable(block != null ? block.getBadge() : null))
                    .title(normalizeNullable(block != null ? block.getTitle() : null))
                    .description(normalizeNullable(block != null ? block.getDescription() : null))
                    .category(category)
                    .tourId(tourId != null && tourId > 0 ? tourId : null)
                    .build());
        }

        return normalizedBlocks;
    }

    private List<HomepageValueCardDto> normalizeValueCards(List<HomepageValueCardDto> cards) {
        if (cards == null || cards.isEmpty()) {
            return defaultValueCards();
        }

        List<HomepageValueCardDto> normalizedCards = new ArrayList<>();

        for (HomepageValueCardDto card : cards) {
            normalizedCards.add(HomepageValueCardDto.builder()
                    .title(normalizeNullable(card != null ? card.getTitle() : null))
                    .description(normalizeNullable(card != null ? card.getDescription() : null))
                    .iconKey(card != null && card.getIconKey() != null ? card.getIconKey() : HomepageValueIconKey.COMPASS)
                    .build());
        }

        return normalizedCards;
    }

    private String normalizeCustomTextColor(UpdateHomepageConfigRequestDto dto) {
        if (dto.getHeroTextColorMode() != HomepageHeroTextColorMode.CUSTOM) {
            return null;
        }

        String customColor = normalizeNullable(dto.getHeroCustomTextColor());
        return customColor != null ? customColor.toLowerCase(Locale.ROOT) : null;
    }

    private String normalizeNullable(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private boolean isValidHexColor(String value) {
        return value.matches("^#(?:[0-9A-Fa-f]{6})$");
    }

    private boolean isValidUrlOrPath(String value) {
        return value.startsWith("/") || value.matches("^https?://.+");
    }

    private List<Long> readLongList(String value) {
        return readJson(value, LONG_LIST_TYPE, List.of());
    }

    private List<HomepageCollectionBlockDto> readCollectionBlocks(String value) {
        List<HomepageCollectionBlockDto> blocks = readJson(value, COLLECTION_BLOCK_LIST_TYPE, defaultCollectionBlocks());
        return blocks.isEmpty() ? defaultCollectionBlocks() : blocks;
    }

    private List<HomepageValueCardDto> readValueCards(String value) {
        List<HomepageValueCardDto> cards = readJson(value, VALUE_CARD_LIST_TYPE, defaultValueCards());
        return cards.isEmpty() ? defaultValueCards() : cards;
    }

    private <T> List<T> readJson(String value, TypeReference<List<T>> typeReference, List<T> fallback) {
        if (value == null || value.isBlank()) {
            return fallback;
        }

        try {
            return objectMapper.readValue(value, typeReference);
        } catch (JsonProcessingException exception) {
            return fallback;
        }
    }

    private String writeJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Failed to serialize homepage configuration", exception);
        }
    }

    private List<HomepageCollectionBlockDto> defaultCollectionBlocks() {
        return List.of(
                HomepageCollectionBlockDto.builder()
                        .badge("City pace")
                        .title("Walking routes")
                        .description("Shorter-format experiences for exploring neighborhoods, landmarks, and local stories on foot.")
                        .category(TourCategory.WALKING)
                        .build(),
                HomepageCollectionBlockDto.builder()
                        .badge("Nature focus")
                        .title("Outdoor escapes")
                        .description("Trails, scenic routes, and fresh-air experiences built for travelers who want room to roam.")
                        .category(TourCategory.HIKING)
                        .build(),
                HomepageCollectionBlockDto.builder()
                        .badge("Stories first")
                        .title("Culture trails")
                        .description("History, art, and local context grouped into tours made for slower, more thoughtful discovery.")
                        .category(TourCategory.CULTURE)
                        .build(),
                HomepageCollectionBlockDto.builder()
                        .badge("Social energy")
                        .title("Food and evening picks")
                        .description("Browse tours that lean into tastings, nightlife, and memorable shared moments after the daytime rush.")
                        .category(TourCategory.FOOD)
                        .build());
    }

    private List<HomepageValueCardDto> defaultValueCards() {
        return List.of(
                HomepageValueCardDto.builder()
                        .title("Curated routes")
                        .description("Compare city walks, nature outings, and themed experiences from one place instead of juggling separate listings.")
                        .iconKey(HomepageValueIconKey.COMPASS)
                        .build(),
                HomepageValueCardDto.builder()
                        .title("Flexible group options")
                        .description("Public and private formats sit side by side so it is easier to choose the right pace and group size.")
                        .iconKey(HomepageValueIconKey.USERS)
                        .build(),
                HomepageValueCardDto.builder()
                        .title("Straightforward booking")
                        .description("Search by date, review the essentials quickly, and move into booking without extra friction.")
                        .iconKey(HomepageValueIconKey.SHIELD_CHECK)
                        .build(),
                HomepageValueCardDto.builder()
                        .title("Useful details upfront")
                        .description("Duration, intensity, languages, and meeting context stay visible while you browse and compare.")
                        .iconKey(HomepageValueIconKey.TIMER_RESET)
                        .build());
    }
}

