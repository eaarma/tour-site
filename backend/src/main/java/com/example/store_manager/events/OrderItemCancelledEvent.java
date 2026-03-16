package com.example.store_manager.events;

import java.math.BigDecimal;
import com.example.store_manager.model.CancelledBy;

public record OrderItemCancelledEvent(
        Long orderItemId,
        CancelledBy actor,
        boolean refundable,
        BigDecimal refundAmount) {
}