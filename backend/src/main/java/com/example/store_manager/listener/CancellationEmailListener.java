package com.example.store_manager.listener;

import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.transaction.event.TransactionPhase;

import com.example.store_manager.events.OrderItemCancelledEvent;
import com.example.store_manager.model.CancelledBy;
import com.example.store_manager.model.OrderItem;
import com.example.store_manager.repository.OrderItemRepository;
import com.example.store_manager.service.EmailService;

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