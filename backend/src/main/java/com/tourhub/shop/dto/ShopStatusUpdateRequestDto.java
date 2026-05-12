package com.tourhub.shop.dto;

import com.tourhub.shop.model.ShopStatus;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShopStatusUpdateRequestDto {

    @NotNull
    private ShopStatus status;

    @Size(max = 1000)
    private String statusReason;
}