package com.example.store_manager.mapper;

import com.example.store_manager.dto.tour.TourCreateDto;
import com.example.store_manager.dto.tour.TourResponseDto;
import com.example.store_manager.model.Tour;
import com.example.store_manager.model.TourImage;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface TourMapper {

    @Mapping(target = "shopId", source = "shop.id")
    @Mapping(target = "images", expression = "java(mapImages(tour.getImages()))")
    TourResponseDto toDto(Tour tour);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "madeBy", ignore = true)
    @Mapping(target = "shop", ignore = true)
    @Mapping(target = "images", ignore = true) // Images handled separately
    Tour toEntity(TourCreateDto dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "madeBy", ignore = true)
    @Mapping(target = "shop", ignore = true)
    @Mapping(target = "images", ignore = true)
    void updateTourFromDto(TourCreateDto dto, @MappingTarget Tour tour);

    // ✅ Helper to map List<TourImage> → List<String>
    default List<String> mapImages(List<TourImage> images) {
        if (images == null)
            return null;
        return images.stream()
                .map(TourImage::getImageUrl)
                .collect(Collectors.toList());
    }
}
