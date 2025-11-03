package com.example.store_manager.dto.tour;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TourImageResponseDto {
    private Long id;
    private String imageUrl;
    private Integer position;
}