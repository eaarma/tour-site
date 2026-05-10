package com.tourhub.shop.dto;

import com.tourhub.shop.model.ShopUserRole;
import com.tourhub.shop.model.ShopUserStatus;
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
