package com.tourhub.order.event;

import java.math.BigDecimal;

import com.tourhub.order.model.CancelledBy;

public record OrderItemCancelledEvent(
        Long orderItemId,
        CancelledBy actor,
        boolean refundable,
        BigDecimal refundAmount) {
}
