package com.tourhub.tour.mapper;

import com.tourhub.tour.dto.TourCreateDto;
import com.tourhub.tour.dto.TourResponseDto;
import com.tourhub.tour.dto.TourUpdateDto;
import com.tourhub.tour.model.Tour;
import com.tourhub.tour.model.TourImage;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface TourMapper {

    // Entity to DTO.
    @Mapping(target = "shopId", source = "shop.id")
    @Mapping(target = "shopName", source = "shop.name")
    @Mapping(target = "images", expression = "java(mapImages(tour.getImages()))")
    @Mapping(target = "categories", source = "categories")
    @Mapping(target = "language", source = "language")
    TourResponseDto toDto(Tour tour);

    // Create DTO to entity.
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "madeBy", ignore = true)
    @Mapping(target = "shop", ignore = true)
    @Mapping(target = "images", ignore = true) // Images are added separately.
    @Mapping(target = "categories", source = "categories")
    @Mapping(target = "language", source = "language")
    Tour toEntity(TourCreateDto dto);

    // Update DTO to entity.
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "shop", ignore = true) // Keep the original shop.
    @Mapping(target = "madeBy", ignore = true)
    @Mapping(target = "images", ignore = true)
    @Mapping(target = "categories", source = "categories")
    @Mapping(target = "language", source = "language")
    void updateTourFromDto(TourCreateDto dto, @MappingTarget Tour tour);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "shop", ignore = true)
    @Mapping(target = "madeBy", ignore = true)
    @Mapping(target = "images", ignore = true)
    @Mapping(target = "categories", source = "categories")
    @Mapping(target = "language", source = "language")
    void updateTourFromDto(TourUpdateDto dto, @MappingTarget Tour tour);

    // Convert a list of TourImage values to image URLs.
    default List<String> mapImages(List<TourImage> images) {
        if (images == null)
            return null;
        return images.stream()
                .map(TourImage::getImageUrl)
                .collect(Collectors.toList());
    }

}
