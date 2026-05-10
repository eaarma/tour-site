package com.tourhub.shop.dto;

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
    private String bankAccountName;
    private String bankAccountIban;
}
