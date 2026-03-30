package com.example.store_manager.mapper;

import org.mapstruct.BeanMapping;
import org.mapstruct.Mapping;

import com.example.store_manager.model.Shop;

import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import com.example.store_manager.dto.shop.ShopCreateRequestDto;
import com.example.store_manager.dto.shop.ShopDto;

@Mapper(componentModel = "spring")
public interface ShopMapper {

    @Mapping(target = "shopName", source = "name")
    ShopDto toDto(Shop shop);

    @Mapping(target = "members", ignore = true)
    Shop toEntity(ShopDto dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "members", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "status", ignore = true)
    Shop toEntity(ShopCreateRequestDto dto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "members", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "status", ignore = true)
    void updateShopFromDto(ShopCreateRequestDto dto, @MappingTarget Shop shop);
}
