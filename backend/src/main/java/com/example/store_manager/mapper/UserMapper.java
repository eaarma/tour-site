package com.example.store_manager.mapper;

import org.mapstruct.Mapper;

import com.example.store_manager.dto.user.UserResponseDto;
import com.example.store_manager.model.User;



@Mapper(componentModel = "spring")
public interface UserMapper {
    UserResponseDto toDto(User user);

    // Optional: You can go both ways if needed
    User toEntity(UserResponseDto dto);
}