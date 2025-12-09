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

    // ✅ ENTITY → DTO (Response)
    @Mapping(target = "shopId", source = "shop.id")
    @Mapping(target = "images", expression = "java(mapImages(tour.getImages()))")
    @Mapping(target = "categories", source = "categories") // ✅ Map directly
    @Mapping(target = "language", source = "language")
    TourResponseDto toDto(Tour tour);

    // ✅ DTO → ENTITY (Create)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "madeBy", ignore = true)
    @Mapping(target = "shop", ignore = true)
    @Mapping(target = "images", ignore = true) // Images added separately
    @Mapping(target = "categories", source = "categories") // ✅ Add this
    @Mapping(target = "language", source = "language") // ✅ Add this
    Tour toEntity(TourCreateDto dto);

    // ✅ DTO → ENTITY (Update)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "shop", ignore = true) // keep original shop
    @Mapping(target = "madeBy", ignore = true)
    @Mapping(target = "images", ignore = true)
    @Mapping(target = "categories", source = "categories")
    @Mapping(target = "language", source = "language")
    void updateTourFromDto(TourCreateDto dto, @MappingTarget Tour tour);

    // ✅ Convert List<TourImage> → List<String>
    default List<String> mapImages(List<TourImage> images) {
        if (images == null)
            return null;
        return images.stream()
                .map(TourImage::getImageUrl)
                .collect(Collectors.toList());
    }

}