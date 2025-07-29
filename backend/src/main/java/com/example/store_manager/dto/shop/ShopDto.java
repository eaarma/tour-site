package com.example.store_manager.dto.shop;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShopDto {
    private Long id;
    private String name;
    private String description;
}