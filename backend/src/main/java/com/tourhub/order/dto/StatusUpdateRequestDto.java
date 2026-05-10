package com.tourhub.order.dto;

import com.tourhub.order.model.OrderStatus;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StatusUpdateRequestDto {
    private OrderStatus status;
}