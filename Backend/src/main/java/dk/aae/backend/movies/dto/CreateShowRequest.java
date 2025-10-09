package dk.aae.backend.movies.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
public class CreateShowRequest {
    
    @NotNull(message = "Movie ID is required")
    private Long movieId;
    
    @NotNull(message = "Theater ID is required")
    private Long theaterId;
    
    @NotNull(message = "Show date is required")
    private LocalDate showDate;
    
    @NotNull(message = "Show time is required")
    private LocalTime showTime;
    
    @NotNull(message = "Ticket price is required")
    private Double ticketPrice;
}