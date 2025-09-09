package com.example.store_manager.dto.tour;

import java.math.BigDecimal;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TourSnapshotDto {
    private Long id;
    private String title;
    private String description;
    private BigDecimal price;
}