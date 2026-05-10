package com.tourhub.user.mapper;

import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import com.tourhub.user.dto.PublicManagerProfileDto;
import com.tourhub.user.dto.UserResponseDto;
import com.tourhub.user.dto.UserUpdateDto;
import com.tourhub.user.model.User;

@Mapper(componentModel = "spring")
public interface UserMapper {

    UserResponseDto toDto(User user);

    PublicManagerProfileDto toPublicManagerProfileDto(User user);

    User toEntity(UserResponseDto dto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateUserFromDto(UserUpdateDto dto, @MappingTarget User user);
}
