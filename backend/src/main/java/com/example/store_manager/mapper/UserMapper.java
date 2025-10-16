package com.example.store_manager.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

import com.example.store_manager.dto.user.UserResponseDto;
import com.example.store_manager.dto.user.UserUpdateDto;
import com.example.store_manager.model.User;

@Mapper(componentModel = "spring")
public interface UserMapper {

    UserResponseDto toDto(User user);

    User toEntity(UserResponseDto dto);

    // ✅ This allows partial updates
    void updateUserFromDto(UserUpdateDto dto, @MappingTarget User user);
}
