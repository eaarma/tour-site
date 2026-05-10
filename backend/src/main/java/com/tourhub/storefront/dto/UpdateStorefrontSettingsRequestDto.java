package com.tourhub.storefront.dto;

import com.tourhub.storefront.model.StorefrontBasePreset;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateStorefrontSettingsRequestDto {

    @NotBlank
    @Size(max = 255)
    private String siteName;

    @Email
    @Size(max = 320)
    private String contactEmail;

    @Email
    @Size(max = 320)
    private String contactReceiverEmail;

    @Size(max = 255)
    private String seoTitle;

    @Size(max = 320)
    private String seoDescription;

    @Size(max = 500)
    private String seoKeywords;

    @Size(max = 500)
    private String ogImageUrl;

    @NotNull
    private Boolean allowIndexing;

    @Size(max = 500)
    private String logoUrl;

    @Size(max = 500)
    private String faviconUrl;

    @NotNull
    private StorefrontBasePreset basePreset;

    @NotBlank
    @Pattern(regexp = "^#(?:[0-9A-Fa-f]{6})$", message = "primaryColor must be a 6-digit hex color")
    private String primaryColor;

    @NotBlank
    @Pattern(regexp = "^#(?:[0-9A-Fa-f]{6})$", message = "accentColor must be a 6-digit hex color")
    private String accentColor;

    @Pattern(regexp = "\\+?[0-9. ()-]{7,25}", message = "supportPhone must be a valid phone number")
    @Size(max = 40)
    private String supportPhone;

    @Size(max = 255)
    private String addressLine1;

    @Size(max = 255)
    private String addressLine2;

    @Size(max = 120)
    private String city;

    @Size(max = 40)
    private String postalCode;

    @Size(max = 120)
    private String country;

    @Size(max = 1000)
    private String businessHours;

    @NotNull
    private Boolean showContactEmail;

    @NotNull
    private Boolean showSupportPhone;

    @NotNull
    private Boolean showAddress;

    @NotNull
    private Boolean showBusinessHours;
}
