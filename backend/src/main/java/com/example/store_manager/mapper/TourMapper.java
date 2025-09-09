package com.example.store_manager.mapper;

import com.example.store_manager.dto.tour.TourResponseDto;
import com.example.store_manager.model.Tour;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import com.example.store_manager.dto.tour.TourCreateDto;

@Mapper(componentModel = "spring")
public interface TourMapper {

    @Mapping(target = "shopId", source = "shop.id")
    @Mapping(target = "madeBy", source = "madeBy")
    TourResponseDto toDto(Tour tour);

    Tour toEntity(TourCreateDto dto);

    // Optionally, update an existing Tour entity from a DTO
    void updateTourFromDto(TourCreateDto dto, @MappingTarget Tour tour);
}