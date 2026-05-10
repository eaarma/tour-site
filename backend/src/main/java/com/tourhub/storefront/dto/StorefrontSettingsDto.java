package com.tourhub.storefront.dto;

import com.tourhub.storefront.model.StorefrontBasePreset;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StorefrontSettingsDto {
    private Long id;
    private String siteName;
    private String contactEmail;
    private String contactReceiverEmail;
    private String seoTitle;
    private String seoDescription;
    private String seoKeywords;
    private String ogImageUrl;
    private Boolean allowIndexing;
    private String logoUrl;
    private String faviconUrl;
    private StorefrontBasePreset basePreset;
    private String primaryColor;
    private String accentColor;
    private String supportPhone;
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String postalCode;
    private String country;
    private String businessHours;
    private Boolean showContactEmail;
    private Boolean showSupportPhone;
    private Boolean showAddress;
    private Boolean showBusinessHours;
    private String createdAt;
    private String updatedAt;
}
