package com.tourhub.payment.mapper;

import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import com.tourhub.payment.dto.PaymentResponseDto;
import com.tourhub.payment.model.Payment;

@Mapper(componentModel = "spring")
public interface PaymentMapper {

    @Mapping(target = "orderId", source = "order.id")
    @Mapping(
            target = "shopAmount",
            expression = "java(payment.getAmountTotal() != null && payment.getPlatformFee() != null ? payment.getAmountTotal().subtract(payment.getPlatformFee()) : null)")
    PaymentResponseDto toDto(Payment payment);

    List<PaymentResponseDto> toDtoList(List<Payment> payments);

}
