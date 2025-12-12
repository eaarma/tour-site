package com.example.store_manager.dto.tourSession;

import com.example.store_manager.model.OrderStatus;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemParticipantDto {
    private Long orderItemId;
    private String name;
    private int participants;
    private OrderStatus status;

    private BigDecimal pricePaid;

    private UUID managerId;
    private String managerName;

    private String email;
    private String phone;
    private String nationality;
}
