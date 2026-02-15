package com.example.store_manager.payment;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.store_manager.config.properties.StripeProperties;
import com.example.store_manager.infrastructure.stripe.StripeWebhookVerifier;
import com.example.store_manager.model.Order;
import com.example.store_manager.model.OrderItem;
import com.example.store_manager.model.OrderStatus;
import com.example.store_manager.model.Payment;
import com.example.store_manager.model.PaymentStatus;
import com.example.store_manager.model.Shop;
import com.example.store_manager.model.Tour;
import com.example.store_manager.model.TourCategory;
import com.example.store_manager.model.TourSchedule;
import com.example.store_manager.repository.OrderRepository;
import com.example.store_manager.repository.PaymentRepository;
import com.example.store_manager.repository.ShopRepository;
import com.example.store_manager.repository.StripeEventRepository;
import com.example.store_manager.repository.TourRepository;
import com.example.store_manager.repository.TourScheduleRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.JsonObject;
import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.model.PaymentIntent;

import jakarta.transaction.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")

class PaymentFlowIntegrationTest {

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private OrderRepository orderRepository;

        @Autowired
        private PaymentRepository paymentRepository;

        @Autowired
        private StripeEventRepository stripeEventRepository;

        @Autowired
        private TourRepository tourRepository;

        @Autowired
        private TourScheduleRepository tourScheduleRepository;

        @Autowired
        private ShopRepository shopRepository;

        @Autowired
        private ObjectMapper objectMapper;

        @MockBean
        StripeWebhookVerifier webhookVerifier;

        @Test
        void webhook_succeeds_payment_and_updates_order() throws Exception {

                // 1️⃣ Create Shop
                Shop shop = Shop.builder()
                                .name("Test Shop")
                                .build();

                shopRepository.save(shop);

                // 2️⃣ Create Tour
                Tour tour = Tour.builder()
                                .title("Test Tour")
                                .description("Test description")
                                .price(BigDecimal.valueOf(100))
                                .timeRequired(60)
                                .intensity("EASY")
                                .participants(10)
                                .categories(Set.of(TourCategory.WALKING))
                                .language(Set.of("EN"))
                                .type("PUBLIC")
                                .location("Test City")
                                .status("ACTIVE")
                                .madeBy("SYSTEM")
                                .shop(shop) // ✅ REQUIRED
                                .build();

                tourRepository.save(tour);

                // 3️⃣ Create Schedule
                TourSchedule schedule = TourSchedule.builder()
                                .tour(tour)
                                .date(LocalDate.now().plusDays(1))
                                .time(LocalTime.of(10, 0))
                                .maxParticipants(20)
                                .bookedParticipants(0)
                                .reservedParticipants(0)
                                .status("ACTIVE")
                                .build();

                tourScheduleRepository.save(schedule);

                // 4️⃣ Create Order
                Order order = Order.builder()
                                .status(OrderStatus.FINALIZED)
                                .paymentMethod("CARD")
                                .totalPrice(BigDecimal.valueOf(100))
                                .build();

                // 5️⃣ Create OrderItem
                OrderItem item = OrderItem.builder()
                                .order(order)
                                .tour(tour)
                                .schedule(schedule)
                                .tourTitle("Test Tour")
                                .participants(2)
                                .pricePaid(BigDecimal.valueOf(100))
                                .scheduledAt(LocalDateTime.now().plusDays(1))
                                .email("test@test.com")
                                .name("John")
                                .phone("12345678")
                                .shopId(shop.getId())
                                .tourSnapshot("{\"title\":\"Test Tour\",\"price\":100}") // ✅ REQUIRED
                                .status(OrderStatus.FINALIZED)
                                .build();

                order.setOrderItems(List.of(item));

                orderRepository.save(order);

                // 2️⃣ Create Payment
                Payment payment = Payment.builder()
                                .order(order)
                                .amountTotal(BigDecimal.valueOf(100))
                                .platformFee(BigDecimal.ZERO)
                                .currency("EUR")
                                .status(PaymentStatus.PENDING)
                                .build();

                paymentRepository.save(payment);

                // 3️⃣ Build fake Stripe webhook JSON
                String webhookJson = """
                                {
                                  "id": "evt_test_123",
                                  "object": "event",
                                  "type": "payment_intent.succeeded",
                                  "data": {
                                    "object": {
                                      "id": "pi_test_123",
                                      "object": "payment_intent",
                                      "metadata": {
                                        "paymentId": "%d"
                                      }
                                    }
                                  }
                                }
                                """.formatted(payment.getId());

                // Build Stripe Event object
                Event event = new Event();
                event.setId("evt_test_123");
                event.setType("payment_intent.succeeded");

                JsonObject piJson = new JsonObject();
                piJson.addProperty("id", "pi_test_123");
                piJson.addProperty("object", "payment_intent");

                JsonObject metadata = new JsonObject();
                metadata.addProperty("paymentId", payment.getId().toString());
                piJson.add("metadata", metadata);

                Event.Data data = new Event.Data();
                data.setObject(piJson);
                event.setData(data);

                when(webhookVerifier.verify(anyString(), anyString())).thenReturn(event);

                // 4️⃣ Call webhook endpoint
                mockMvc.perform(post("/stripe/webhook")
                                .header("Stripe-Signature", "test-signature")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(webhookJson))
                                .andExpect(status().isOk());

                // 5️⃣ Reload entities
                Payment updatedPayment = paymentRepository.findById(payment.getId()).orElseThrow();

                Order updatedOrder = orderRepository.findByIdWithItems(order.getId()).orElseThrow();

                // 6️⃣ Assertions
                assertEquals(PaymentStatus.SUCCEEDED, updatedPayment.getStatus());
                assertEquals(OrderStatus.PAID, updatedOrder.getStatus());

                updatedOrder.getOrderItems()
                                .forEach(i -> assertEquals(OrderStatus.PAID, i.getStatus()));

                assertTrue(
                                stripeEventRepository
                                                .existsByStripeEventId("evt_test_123"));
        }
}
