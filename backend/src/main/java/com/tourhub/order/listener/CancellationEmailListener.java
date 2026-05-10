package com.tourhub.order.listener;

import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.transaction.event.TransactionPhase;

import com.tourhub.common.email.EmailService;
import com.tourhub.order.event.OrderItemCancelledEvent;
import com.tourhub.order.model.CancelledBy;
import com.tourhub.order.model.OrderItem;
import com.tourhub.order.repository.OrderItemRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class CancellationEmailListener {

    private final OrderItemRepository orderItemRepository;
    private final EmailService emailService;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleOrderItemCancelled(OrderItemCancelledEvent event) {

        OrderItem item = orderItemRepository.findById(event.orderItemId())
                .orElseThrow(() -> new IllegalStateException("OrderItem not found"));

        if (event.actor() == CancelledBy.GUIDE) {
            emailService.sendProviderCancellationNotice(
                    item,
                    event.refundAmount());
            return;
        }

        emailService.sendCancellationConfirmation(
                item,
                event.refundable(),
                event.refundAmount());
    }
}
