package com.example.store_manager.dto.shop;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShopCreateRequestDto {
    @NotBlank
    private String name;

    private String description;
}