package com.tourhub.storefront.model;

import java.time.Instant;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "storefront_settings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class StorefrontSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "site_name", nullable = false, length = 255)
    private String siteName;

    @Column(name = "contact_email", length = 320)
    private String contactEmail;

    @Column(name = "contact_receiver_email", length = 320)
    private String contactReceiverEmail;

    @Column(name = "seo_title", length = 255)
    private String seoTitle;

    @Column(name = "seo_description", length = 320)
    private String seoDescription;

    @Column(name = "seo_keywords", length = 500)
    private String seoKeywords;

    @Column(name = "og_image_url", length = 500)
    private String ogImageUrl;

    @Column(name = "allow_indexing", nullable = false)
    private Boolean allowIndexing;

    @Column(name = "logo_url", length = 500)
    private String logoUrl;

    @Column(name = "favicon_url", length = 500)
    private String faviconUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "base_preset", nullable = false, length = 30)
    private StorefrontBasePreset basePreset;

    @Column(name = "primary_color", nullable = false, length = 7)
    private String primaryColor;

    @Column(name = "accent_color", nullable = false, length = 7)
    private String accentColor;

    @Column(name = "support_phone", length = 40)
    private String supportPhone;

    @Column(name = "address_line_1", length = 255)
    private String addressLine1;

    @Column(name = "address_line_2", length = 255)
    private String addressLine2;

    @Column(name = "city", length = 120)
    private String city;

    @Column(name = "postal_code", length = 40)
    private String postalCode;

    @Column(name = "country", length = 120)
    private String country;

    @Column(name = "business_hours", length = 1000)
    private String businessHours;

    @Column(name = "show_contact_email", nullable = false)
    private Boolean showContactEmail;

    @Column(name = "show_support_phone", nullable = false)
    private Boolean showSupportPhone;

    @Column(name = "show_address", nullable = false)
    private Boolean showAddress;

    @Column(name = "show_business_hours", nullable = false)
    private Boolean showBusinessHours;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
