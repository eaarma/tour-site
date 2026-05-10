package com.tourhub.storefront.model;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "homepage_configs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HomepageConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "hero_enabled", nullable = false)
    private Boolean heroEnabled;

    @Column(name = "hero_title", length = 255)
    private String heroTitle;

    @Column(name = "hero_subtitle", length = 1000)
    private String heroSubtitle;

    @Column(name = "hero_button_text", length = 120)
    private String heroButtonText;

    @Column(name = "hero_button_link", length = 500)
    private String heroButtonLink;

    @Enumerated(EnumType.STRING)
    @Column(name = "hero_content_position", nullable = false, length = 30)
    private HomepageHeroContentPosition heroContentPosition;

    @Column(name = "hero_image_url", length = 500)
    private String heroImageUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "hero_text_color_mode", nullable = false, length = 30)
    private HomepageHeroTextColorMode heroTextColorMode;

    @Column(name = "hero_custom_text_color", length = 20)
    private String heroCustomTextColor;

    @Column(name = "hero_overlay_strength", nullable = false)
    private Integer heroOverlayStrength;

    @Column(name = "featured_enabled", nullable = false)
    private Boolean featuredEnabled;

    @Column(name = "featured_title", length = 255)
    private String featuredTitle;

    @Enumerated(EnumType.STRING)
    @Column(name = "featured_selection_mode", nullable = false, length = 30)
    private HomepageSelectionMode featuredSelectionMode;

    @Column(name = "featured_tour_ids_json", columnDefinition = "TEXT", nullable = false)
    private String featuredTourIdsJson;

    @Column(name = "featured_max_items", nullable = false)
    private Integer featuredMaxItems;

    @Column(name = "highlighted_enabled", nullable = false)
    private Boolean highlightedEnabled;

    @Column(name = "highlighted_title", length = 255)
    private String highlightedTitle;

    @Enumerated(EnumType.STRING)
    @Column(name = "highlighted_selection_mode", nullable = false, length = 30)
    private HomepageSelectionMode highlightedSelectionMode;

    @Column(name = "highlighted_tour_ids_json", columnDefinition = "TEXT", nullable = false)
    private String highlightedTourIdsJson;

    @Column(name = "collection_enabled", nullable = false)
    private Boolean collectionEnabled;

    @Column(name = "collection_title", length = 255)
    private String collectionTitle;

    @Column(name = "collection_blocks_json", columnDefinition = "TEXT", nullable = false)
    private String collectionBlocksJson;

    @Column(name = "value_section_enabled", nullable = false)
    private Boolean valueSectionEnabled;

    @Column(name = "value_eyebrow", length = 120)
    private String valueEyebrow;

    @Column(name = "value_title", length = 255)
    private String valueTitle;

    @Column(name = "value_description", length = 1000)
    private String valueDescription;

    @Column(name = "value_cards_json", columnDefinition = "TEXT", nullable = false)
    private String valueCardsJson;

    @Column(name = "about_enabled", nullable = false)
    private Boolean aboutEnabled;

    @Column(name = "about_eyebrow", length = 120)
    private String aboutEyebrow;

    @Column(name = "about_title", length = 255)
    private String aboutTitle;

    @Column(name = "about_description", length = 1000)
    private String aboutDescription;

    @Column(name = "about_button_text", length = 120)
    private String aboutButtonText;

    @Column(name = "cta_enabled", nullable = false)
    private Boolean ctaEnabled;

    @Column(name = "cta_title", length = 255)
    private String ctaTitle;

    @Column(name = "cta_description", length = 1000)
    private String ctaDescription;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();

        if (createdAt == null) {
            createdAt = now;
        }

        updatedAt = now;
        applyDefaults();
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
        applyDefaults();
    }

    private void applyDefaults() {
        if (heroEnabled == null) {
            heroEnabled = Boolean.TRUE;
        }

        if (heroContentPosition == null) {
            heroContentPosition = HomepageHeroContentPosition.LEFT;
        }

        if (heroTextColorMode == null) {
            heroTextColorMode = HomepageHeroTextColorMode.AUTO;
        }

        if (heroOverlayStrength == null || heroOverlayStrength < 0 || heroOverlayStrength > 100) {
            heroOverlayStrength = 42;
        }

        if (featuredEnabled == null) {
            featuredEnabled = Boolean.TRUE;
        }

        if (featuredSelectionMode == null) {
            featuredSelectionMode = HomepageSelectionMode.RANDOM;
        }

        if (featuredTourIdsJson == null) {
            featuredTourIdsJson = "[]";
        }

        if (featuredMaxItems == null || featuredMaxItems < 1) {
            featuredMaxItems = 8;
        }

        if (highlightedEnabled == null) {
            highlightedEnabled = Boolean.TRUE;
        }

        if (highlightedSelectionMode == null) {
            highlightedSelectionMode = HomepageSelectionMode.RANDOM;
        }

        if (highlightedTourIdsJson == null) {
            highlightedTourIdsJson = "[]";
        }

        if (collectionEnabled == null) {
            collectionEnabled = Boolean.TRUE;
        }

        if (collectionBlocksJson == null) {
            collectionBlocksJson = "[]";
        }

        if (valueSectionEnabled == null) {
            valueSectionEnabled = Boolean.TRUE;
        }

        if (valueCardsJson == null) {
            valueCardsJson = "[]";
        }

        if (aboutEnabled == null) {
            aboutEnabled = Boolean.TRUE;
        }

        if (ctaEnabled == null) {
            ctaEnabled = Boolean.TRUE;
        }
    }
}
