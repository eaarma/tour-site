package com.tourhub.session.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import com.tourhub.common.result.Result;
import com.tourhub.order.model.CancelledBy;
import com.tourhub.order.model.CancellationReasonType;
import com.tourhub.order.service.CancellationService;
import com.tourhub.order.model.OrderItem;
import com.tourhub.order.repository.OrderItemRepository;
import com.tourhub.payment.model.PaymentLine;
import com.tourhub.payment.model.PaymentLineType;
import com.tourhub.payment.model.PaymentStatus;
import com.tourhub.payment.repository.PaymentLineRepository;
import com.tourhub.session.model.SessionStatus;
import com.tourhub.session.model.TourSession;
import com.tourhub.session.repository.TourSessionRepository;
import com.tourhub.shop.model.ShopUserStatus;
import com.tourhub.shop.repository.ShopUserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class SessionCancellationService {

        private final TourSessionRepository sessionRepository;
        private final OrderItemRepository orderItemRepository;
        private final CancellationService cancellationService;
        private final PaymentLineRepository paymentLineRepository;
        private final ShopUserRepository shopUserRepository;

        private static final BigDecimal PROCESSING_RATE = new BigDecimal("0.02");

        @Transactional
        public void cancelSessionByGuide(Long sessionId, UUID userId) {

                TourSession session = sessionRepository
                                .findByIdForUpdate(sessionId)
                                .orElseThrow(() -> new IllegalStateException("Session not found"));

                Long shopId = session.getSchedule()
                                .getTour()
                                .getShop()
                                .getId();

                // 🔒 Authorization check
                boolean allowed = shopUserRepository
                                .existsByShopIdAndUserIdAndStatus(
                                                shopId,
                                                userId,
                                                ShopUserStatus.ACTIVE);

                if (!allowed) {
                        throw new IllegalStateException("Not allowed to cancel this session");
                }

                if (session.getStatus() == SessionStatus.CANCELLED) {
                        return;
                }

                List<OrderItem> items = orderItemRepository
                                .findPaidBySessionIdWithSchedule(sessionId);

                BigDecimal totalRefunded = BigDecimal.ZERO;

                for (OrderItem item : items) {
                        var result = cancellationService.cancelOrderItem(
                                        item,
                                        CancelledBy.GUIDE,
                                        CancellationReasonType.PROVIDER_CANCELLED,
                                        "Session cancelled by guide");

                        if (result.isOk()) {
                                totalRefunded = totalRefunded.add(result.get().refundAmount());
                        }
                }

                applyProcessingFee(session, shopId, totalRefunded);

                session.setStatus(SessionStatus.CANCELLED);
                session.setCancelledBy(CancelledBy.GUIDE);
                session.setCancelledAt(Instant.now());

                session.getSchedule().setStatus("CANCELLED");

                log.info("Session {} cancelled by guide. Refund total={}", sessionId, totalRefunded);
        }

        private void applyProcessingFee(TourSession session, Long shopId, BigDecimal totalRefunded) {

                if (totalRefunded.compareTo(BigDecimal.ZERO) <= 0) {
                        return;
                }

                BigDecimal fee = totalRefunded
                                .multiply(PROCESSING_RATE)
                                .setScale(2, RoundingMode.HALF_UP);

                PaymentLine line = PaymentLine.builder()
                                .payment(null)
                                .orderItem(null)
                                .session(session)
                                .shopId(shopId)
                                .grossAmount(fee.negate())
                                .platformFee(BigDecimal.ZERO)
                                .shopAmount(fee.negate())
                                .type(PaymentLineType.CANCELLATION_FEE)
                                .currency("EUR")
                                .status(PaymentStatus.SUCCEEDED)
                                .build();

                paymentLineRepository.save(line);
        }
}

