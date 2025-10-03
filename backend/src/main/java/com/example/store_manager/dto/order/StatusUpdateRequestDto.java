package com.example.store_manager.dto.order;

import com.example.store_manager.model.OrderStatus;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StatusUpdateRequestDto {
    private OrderStatus status;
}