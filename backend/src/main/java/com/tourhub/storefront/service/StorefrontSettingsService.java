package com.tourhub.storefront.service;

import java.util.Locale;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tourhub.common.result.Result;
import com.tourhub.storefront.dto.StorefrontSettingsDto;
import com.tourhub.storefront.dto.UpdateStorefrontSettingsRequestDto;
import com.tourhub.storefront.model.StorefrontBasePreset;
import com.tourhub.storefront.model.StorefrontSettings;
import com.tourhub.storefront.repository.StorefrontSettingsRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class StorefrontSettingsService {

    private static final String DEFAULT_SITE_NAME = "TourHub";
    private static final StorefrontBasePreset DEFAULT_BASE_PRESET = StorefrontBasePreset.SLATE;
    private static final String DEFAULT_PRIMARY_COLOR = "#0284c7";
    private static final String DEFAULT_ACCENT_COLOR = "#f59e0b";
    private static final String DEFAULT_SEO_DESCRIPTION = "Explore and Book Amazing Tours";
    private static final boolean DEFAULT_ALLOW_INDEXING = true;
    private static final boolean DEFAULT_SHOW_CONTACT_EMAIL = true;
    private static final boolean DEFAULT_SHOW_SUPPORT_PHONE = true;
    private static final boolean DEFAULT_SHOW_ADDRESS = true;
    private static final boolean DEFAULT_SHOW_BUSINESS_HOURS = true;

    private final StorefrontSettingsRepository storefrontSettingsRepository;

    @Transactional(readOnly = true)
    public Result<StorefrontSettingsDto> getSettings() {
        StorefrontSettingsDto settings = storefrontSettingsRepository.findTopByOrderByIdAsc()
                .map(this::toDto)
                .orElseGet(this::toDefaultDto);

        return Result.ok(settings);
    }

    @Transactional
    public Result<StorefrontSettingsDto> updateSettings(UpdateStorefrontSettingsRequestDto dto) {
        StorefrontSettings settings = storefrontSettingsRepository.findTopByOrderByIdAsc()
                .orElseGet(() -> StorefrontSettings.builder()
                        .siteName(DEFAULT_SITE_NAME)
                        .basePreset(DEFAULT_BASE_PRESET)
                        .primaryColor(DEFAULT_PRIMARY_COLOR)
                        .accentColor(DEFAULT_ACCENT_COLOR)
                        .seoDescription(DEFAULT_SEO_DESCRIPTION)
                        .allowIndexing(DEFAULT_ALLOW_INDEXING)
                        .showContactEmail(DEFAULT_SHOW_CONTACT_EMAIL)
                        .showSupportPhone(DEFAULT_SHOW_SUPPORT_PHONE)
                        .showAddress(DEFAULT_SHOW_ADDRESS)
                        .showBusinessHours(DEFAULT_SHOW_BUSINESS_HOURS)
                        .build());

        settings.setSiteName(dto.getSiteName().trim());
        settings.setContactEmail(normalizeNullable(dto.getContactEmail()));
        settings.setContactReceiverEmail(normalizeNullable(dto.getContactReceiverEmail()));
        settings.setSeoTitle(normalizeNullable(dto.getSeoTitle()));
        settings.setSeoDescription(normalizeNullable(dto.getSeoDescription()));
        settings.setSeoKeywords(normalizeNullable(dto.getSeoKeywords()));
        settings.setOgImageUrl(normalizeNullable(dto.getOgImageUrl()));
        settings.setAllowIndexing(dto.getAllowIndexing());
        settings.setLogoUrl(normalizeNullable(dto.getLogoUrl()));
        settings.setFaviconUrl(normalizeNullable(dto.getFaviconUrl()));
        settings.setBasePreset(dto.getBasePreset());
        settings.setPrimaryColor(normalizeColorHex(dto.getPrimaryColor()));
        settings.setAccentColor(normalizeColorHex(dto.getAccentColor()));
        settings.setSupportPhone(normalizeNullable(dto.getSupportPhone()));
        settings.setAddressLine1(normalizeNullable(dto.getAddressLine1()));
        settings.setAddressLine2(normalizeNullable(dto.getAddressLine2()));
        settings.setCity(normalizeNullable(dto.getCity()));
        settings.setPostalCode(normalizeNullable(dto.getPostalCode()));
        settings.setCountry(normalizeNullable(dto.getCountry()));
        settings.setBusinessHours(normalizeNullable(dto.getBusinessHours()));
        settings.setShowContactEmail(dto.getShowContactEmail());
        settings.setShowSupportPhone(dto.getShowSupportPhone());
        settings.setShowAddress(dto.getShowAddress());
        settings.setShowBusinessHours(dto.getShowBusinessHours());

        StorefrontSettings savedSettings = storefrontSettingsRepository.save(settings);

        return Result.ok(toDto(savedSettings));
    }

    private StorefrontSettingsDto toDto(StorefrontSettings settings) {
        return StorefrontSettingsDto.builder()
                .id(settings.getId())
                .siteName(settings.getSiteName())
                .contactEmail(settings.getContactEmail())
                .contactReceiverEmail(settings.getContactReceiverEmail())
                .seoTitle(settings.getSeoTitle())
                .seoDescription(settings.getSeoDescription() != null ? settings.getSeoDescription()
                        : DEFAULT_SEO_DESCRIPTION)
                .seoKeywords(settings.getSeoKeywords())
                .ogImageUrl(settings.getOgImageUrl())
                .allowIndexing(settings.getAllowIndexing() != null ? settings.getAllowIndexing()
                        : DEFAULT_ALLOW_INDEXING)
                .logoUrl(settings.getLogoUrl())
                .faviconUrl(settings.getFaviconUrl())
                .basePreset(settings.getBasePreset() != null ? settings.getBasePreset() : DEFAULT_BASE_PRESET)
                .primaryColor(settings.getPrimaryColor() != null ? settings.getPrimaryColor() : DEFAULT_PRIMARY_COLOR)
                .accentColor(settings.getAccentColor() != null ? settings.getAccentColor() : DEFAULT_ACCENT_COLOR)
                .supportPhone(settings.getSupportPhone())
                .addressLine1(settings.getAddressLine1())
                .addressLine2(settings.getAddressLine2())
                .city(settings.getCity())
                .postalCode(settings.getPostalCode())
                .country(settings.getCountry())
                .businessHours(settings.getBusinessHours())
                .showContactEmail(settings.getShowContactEmail() != null ? settings.getShowContactEmail()
                        : DEFAULT_SHOW_CONTACT_EMAIL)
                .showSupportPhone(settings.getShowSupportPhone() != null ? settings.getShowSupportPhone()
                        : DEFAULT_SHOW_SUPPORT_PHONE)
                .showAddress(settings.getShowAddress() != null ? settings.getShowAddress() : DEFAULT_SHOW_ADDRESS)
                .showBusinessHours(settings.getShowBusinessHours() != null ? settings.getShowBusinessHours()
                        : DEFAULT_SHOW_BUSINESS_HOURS)
                .createdAt(settings.getCreatedAt() != null ? settings.getCreatedAt().toString() : null)
                .updatedAt(settings.getUpdatedAt() != null ? settings.getUpdatedAt().toString() : null)
                .build();
    }

    private StorefrontSettingsDto toDefaultDto() {
        return StorefrontSettingsDto.builder()
                .siteName(DEFAULT_SITE_NAME)
                .seoDescription(DEFAULT_SEO_DESCRIPTION)
                .allowIndexing(DEFAULT_ALLOW_INDEXING)
                .basePreset(DEFAULT_BASE_PRESET)
                .primaryColor(DEFAULT_PRIMARY_COLOR)
                .accentColor(DEFAULT_ACCENT_COLOR)
                .showContactEmail(DEFAULT_SHOW_CONTACT_EMAIL)
                .showSupportPhone(DEFAULT_SHOW_SUPPORT_PHONE)
                .showAddress(DEFAULT_SHOW_ADDRESS)
                .showBusinessHours(DEFAULT_SHOW_BUSINESS_HOURS)
                .build();
    }

    private String normalizeNullable(String value) {
        if (value == null) {
            return null;
        }

        String trimmedValue = value.trim();
        return trimmedValue.isEmpty() ? null : trimmedValue;
    }

    private String normalizeColorHex(String value) {
        return value.trim().toLowerCase(Locale.ROOT);
    }
}

