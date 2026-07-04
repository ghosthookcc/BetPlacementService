package dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

public final class Request extends Dto
{
    public record PlaceBet(
            @NotNull(message = "userId is required")
            Long userId,

            @NotNull(message = "eventId is required")
            UUID eventId,

            @NotBlank(message = "selection is required")
            String selection,

            @NotNull(message = "stake is required")
            @DecimalMin(value = "0.01", message = "stake must be greater than zero")
            BigDecimal stake,

            @NotBlank(message = "requestId is required")
            String requestId
    ) {}
}