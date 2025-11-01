package com.example.store_manager.dto.tour;

import java.math.BigDecimal;
import java.util.List;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TourResponseDto {
    private Long id;
    private String title;
    private String description;
    private List<String> images;
    private BigDecimal price;
    private Integer timeRequired;
    private String intensity;
    private int participants;
    private String category;
    private String language;
    private String type;
    private String location;
    private String status;
    private String madeBy;
    private Long shopId;
}