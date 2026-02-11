package com.example.store_manager.service;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

import org.springframework.transaction.annotation.Transactional;

import com.example.store_manager.dto.payment.PaymentLineResponseDto;
import com.example.store_manager.dto.payment.PaymentResponseDto;
import com.example.store_manager.mapper.PaymentLineMapper;
import com.example.store_manager.mapper.PaymentMapper;
import com.example.store_manager.model.Order;
import com.example.store_manager.model.OrderItem;
import com.example.store_manager.model.Payment;
import com.example.store_manager.model.PaymentLine;
import com.example.store_manager.model.PaymentStatus;
import com.example.store_manager.repository.PaymentLineRepository;
import com.example.store_manager.repository.PaymentRepository;
import com.example.store_manager.utility.ApiError;
import com.example.store_manager.utility.Result;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private static final BigDecimal PLATFORM_RATE = new BigDecimal("0.10");

    private final PaymentRepository paymentRepository;
    private final PaymentLineRepository paymentLineRepository;
    private final PaymentMapper paymentMapper;
    private final PaymentLineMapper paymentLineMapper;

    @Transactional
    public Payment createForOrder(Order order) {

        BigDecimal totalFee = BigDecimal.ZERO;

        Payment payment = Payment.builder()
                .order(order)
                .amountTotal(order.getTotalPrice())
                .platformFee(BigDecimal.ZERO)
                .currency("EUR")
                .status(PaymentStatus.SUCCEEDED)
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
                    .status(PaymentStatus.SUCCEEDED)
                    .build();

            paymentLineRepository.save(line);
        }

        saved.setPlatformFee(totalFee);

        return paymentRepository.save(saved);
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
