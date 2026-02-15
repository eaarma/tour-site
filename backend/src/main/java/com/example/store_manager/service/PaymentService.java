package com.example.store_manager.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.store_manager.dto.payment.PaymentLineResponseDto;
import com.example.store_manager.dto.payment.PaymentResponseDto;
import com.example.store_manager.mapper.PaymentLineMapper;
import com.example.store_manager.mapper.PaymentMapper;
import com.example.store_manager.model.Order;
import com.example.store_manager.model.OrderItem;
import com.example.store_manager.model.OrderStatus;
import com.example.store_manager.model.Payment;
import com.example.store_manager.model.PaymentLine;
import com.example.store_manager.model.PaymentStatus;
import com.example.store_manager.repository.PaymentLineRepository;
import com.example.store_manager.repository.PaymentRepository;
import com.example.store_manager.utility.ApiError;
import com.example.store_manager.utility.Result;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private static final BigDecimal PLATFORM_RATE = new BigDecimal("0.10");

    private final PaymentRepository paymentRepository;
    private final PaymentLineRepository paymentLineRepository;
    private final PaymentMapper paymentMapper;
    private final PaymentLineMapper paymentLineMapper;
    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);
    private final EmailService emailService;

    @Transactional
    public Payment createPendingForOrder(Order order) {

        BigDecimal totalFee = BigDecimal.ZERO;

        Payment payment = Payment.builder()
                .order(order)
                .amountTotal(order.getTotalPrice())
                .platformFee(BigDecimal.ZERO)
                .currency("EUR")
                .status(PaymentStatus.PENDING)
                .build();

        Payment saved = paymentRepository.save(payment);

        for (OrderItem item : order.getOrderItems()) {

            BigDecimal gross = item.getPricePaid();

            BigDecimal fee = gross.multiply(PLATFORM_RATE)
                    .setScale(2, RoundingMode.HALF_UP);

            BigDecimal shopAmount = gross.subtract(fee);

            totalFee = totalFee.add(fee);

            PaymentLine line = PaymentLine.builder()
                    .payment(saved)
                    .orderItem(item)
                    .shopId(item.getShopId())
                    .grossAmount(gross)
                    .platformFee(fee)
                    .shopAmount(shopAmount)
                    .currency("EUR")
                    .status(PaymentStatus.PENDING)
                    .build();

            paymentLineRepository.save(line);
        }

        saved.setPlatformFee(totalFee);

        return paymentRepository.save(saved);
    }

    @Transactional
    public Result<Void> markPaymentSucceeded(Long paymentId) {

        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new IllegalStateException(
                        "Payment not found: " + paymentId));

        // idempotency guard
        if (payment.getStatus() == PaymentStatus.SUCCEEDED) {
            return Result.ok();
        }

        // 1. Payment
        payment.setStatus(PaymentStatus.SUCCEEDED);

        // 2. Payment lines
        for (PaymentLine line : payment.getPaymentLines()) {
            line.setStatus(PaymentStatus.SUCCEEDED);
        }

        // 3. Order + OrderItems
        Order order = payment.getOrder();

        order.setStatus(OrderStatus.PAID);

        for (OrderItem item : order.getOrderItems()) {
            item.setStatus(OrderStatus.PAID);
        }

        try {
            emailService.sendOrderConfirmation(order);
        } catch (Exception e) {
            log.error("Email failed for order {}", order.getId(), e);
        }

        log.info("Payment succeeded: orderId={}, paymentId={}", order.getId(), paymentId);

        paymentRepository.save(payment);

        return Result.ok();
    }

    @Transactional(readOnly = true)
    public Result<PaymentResponseDto> getById(Long id) {

        Payment payment = paymentRepository.findById(id).orElse(null);

        if (payment == null) {
            return Result.fail(ApiError.notFound("Payment not found"));
        }

        return Result.ok(paymentMapper.toDto(payment));
    }

    @Transactional(readOnly = true)
    public Result<PaymentResponseDto> getByOrderId(Long orderId) {

        Payment payment = paymentRepository.findByOrderId(orderId).orElse(null);

        if (payment == null) {
            return Result.fail(ApiError.notFound("Payment not found"));
        }

        return Result.ok(paymentMapper.toDto(payment));
    }

    @Transactional(readOnly = true)
    public Result<List<PaymentLineResponseDto>> getShopPayments(Long shopId) {

        List<PaymentLine> lines = paymentLineRepository.findUnpaidByShopId(shopId);

        return Result.ok(paymentLineMapper.toDtoList(lines));
    }
}
