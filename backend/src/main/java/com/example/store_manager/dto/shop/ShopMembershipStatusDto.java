package com.example.store_manager.dto.shop;

import com.example.store_manager.model.ShopUserRole;
import com.example.store_manager.model.ShopUserStatus;
import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ShopMembershipStatusDto {
    private boolean member;
    private ShopUserRole role;
    private ShopUserStatus status;
}