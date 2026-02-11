package com.example.store_manager.mapper;

import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import com.example.store_manager.dto.payment.PaymentLineResponseDto;
import com.example.store_manager.model.PaymentLine;

@Mapper(componentModel = "spring")
public interface PaymentLineMapper {

    @Mapping(target = "paymentId", source = "payment.id")
    @Mapping(target = "orderItemId", source = "orderItem.id")
    @Mapping(target = "orderId", source = "orderItem.order.id")
    @Mapping(target = "tourTitle", source = "orderItem.tourTitle")
    @Mapping(target = "scheduledAt", source = "orderItem.scheduledAt")
    @Mapping(target = "participants", source = "orderItem.participants")
    PaymentLineResponseDto toDto(PaymentLine line);

    List<PaymentLineResponseDto> toDtoList(List<PaymentLine> lines);
}
