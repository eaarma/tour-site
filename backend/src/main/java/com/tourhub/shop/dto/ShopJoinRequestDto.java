package com.tourhub.shop.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShopJoinRequestDto {
    @NotNull
    private Long shopId;
    private String message;
}
