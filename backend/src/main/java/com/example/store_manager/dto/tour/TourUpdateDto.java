package com.example.store_manager.dto.tour;

import java.math.BigDecimal;
import java.util.List;
import com.example.store_manager.model.TourCategory;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TourUpdateDto {
    private String title;
    private String description;
    private BigDecimal price;
    private Integer timeRequired;
    private Integer participants;
    private String intensity;
    private String type;
    private String language;
    private String location;
    private String status;
    private List<TourCategory> categories; // Enum list
}