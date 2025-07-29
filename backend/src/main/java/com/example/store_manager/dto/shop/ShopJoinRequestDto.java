package com.example.store_manager.dto.shop;

import jakarta.validation.constraints.NotNull;
import lombok.*;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShopJoinRequestDto {
    @NotNull
    private Long shopId;

    private String message; // optional note
}