package com.tourhub.storefront.dto;

import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StorePageDto {
    private Long id;
    private String slug;
    private String eyebrow;
    private String title;
    private String description;
    private Map<String, Object> contentJson;
    private String closingNote;
    private String createdAt;
    private String updatedAt;
}
