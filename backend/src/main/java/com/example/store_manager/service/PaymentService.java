package com.example.store_manager.service;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

import org.springframework.transaction.annotation.Transactional;

import com.example.store_manager.dto.payment.PaymentResponseDto;
import com.example.store_manager.mapper.PaymentMapper;
import com.example.store_manager.model.Order;
import com.example.store_manager.model.Payment;
import com.example.store_manager.model.PaymentStatus;
import com.example.store_manager.repository.PaymentRepository;
import com.example.store_manager.utility.ApiError;
import com.example.store_manager.utility.Result;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private static final BigDecimal PLATFORM_RATE = new BigDecimal("0.10");

    private final PaymentRepository paymentRepository;
    private final PaymentMapper paymentMapper;

    @Transactional
    public Payment createForOrder(Order order) {

        BigDecimal total = order.getTotalPrice();

        BigDecimal platformFee = total.multiply(PLATFORM_RATE)
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal shopAmount = total.subtract(platformFee);

        Payment payment = Payment.builder()
                .order(order)
                .amountTotal(total)
                .platformFee(platformFee)
                .shopAmount(shopAmount)
                .currency("EUR")
                .status(PaymentStatus.SUCCEEDED)
                .build();

        return paymentRepository.save(payment);
    }

    @Transactional(readOnly = true)
    public Result<PaymentResponseDto> getById(Long id) {

        Payment payment = paymentRepository.findById(id)
                .orElse(null);

        if (payment == null) {
            return Result.fail(ApiError.notFound("Payment not found"));
        }

        return Result.ok(paymentMapper.toDto(payment));
    }

    @Transactional(readOnly = true)
    public Result<PaymentResponseDto> getByOrderId(Long orderId) {

        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElse(null);

        if (payment == null) {
            return Result.fail(ApiError.notFound("Payment not found for order"));
        }

        return Result.ok(paymentMapper.toDto(payment));
    }

    @Transactional(readOnly = true)
    public Result<List<PaymentResponseDto>> getByShop(Long shopId) {

        List<Payment> payments = paymentRepository.findUnpaidByShopId(shopId);

        return Result.ok(paymentMapper.toDtoList(payments));
    }
}
