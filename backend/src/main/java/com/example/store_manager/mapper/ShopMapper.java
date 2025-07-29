package com.example.store_manager.mapper;

import org.mapstruct.BeanMapping;

import com.example.store_manager.model.Shop;

import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import com.example.store_manager.dto.shop.ShopCreateRequestDto;
import com.example.store_manager.dto.shop.ShopDto;

@Mapper(componentModel = "spring")
public interface ShopMapper {

    ShopDto toDto(Shop shop);

    Shop toEntity(ShopDto dto);

    Shop toEntity(ShopCreateRequestDto dto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateShopFromDto(ShopCreateRequestDto dto, @MappingTarget Shop shop);
}