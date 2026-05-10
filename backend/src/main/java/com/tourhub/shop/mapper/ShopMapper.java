package com.tourhub.shop.mapper;

import org.mapstruct.BeanMapping;
import org.mapstruct.Mapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import com.tourhub.shop.dto.ShopCreateRequestDto;
import com.tourhub.shop.dto.ShopDto;
import com.tourhub.shop.model.Shop;

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
