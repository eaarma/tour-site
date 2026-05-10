package com.tourhub.payment.mapper;

import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import com.tourhub.payment.dto.PaymentLineResponseDto;
import com.tourhub.payment.model.PaymentLine;

@Mapper(componentModel = "spring")
public interface PaymentLineMapper {

    @Mapping(target = "paymentId", source = "payment.id")
    @Mapping(target = "orderItemId", source = "orderItem.id")
    @Mapping(target = "orderId", source = "orderItem.order.id")

    @Mapping(target = "tourTitle", source = "orderItem.tourTitle")
    @Mapping(target = "scheduledAt", source = "orderItem.scheduledAt")
    @Mapping(target = "participants", source = "orderItem.participants")
    @Mapping(target = "type", source = "type")
    @Mapping(target = "sessionId", source = "session.id")

    PaymentLineResponseDto toDto(PaymentLine line);

    List<PaymentLineResponseDto> toDtoList(List<PaymentLine> lines);
}