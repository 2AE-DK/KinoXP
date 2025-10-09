package dk.aae.backend.movies.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CreateBookingRequest {
    
    @NotNull(message = "Show ID is required")
    private Long showId;
    
    @NotBlank(message = "Customer name is required")
    private String customerName;
    
    @NotBlank(message = "Customer email is required")
    @Email(message = "Valid email is required")
    private String customerEmail;
    
    @NotBlank(message = "Customer phone is required")
    private String customerPhone;
    
    @NotNull(message = "Number of tickets is required")
    @Positive(message = "Number of tickets must be positive")
    private Integer numberOfTickets;
    
    @NotNull(message = "Seat selection is required")
    private List<SeatSelection> seats;
    
    @Getter
    @Setter
    public static class SeatSelection {
        @NotNull(message = "Row number is required")
        private Integer rowNumber;
        
        @NotNull(message = "Seat number is required")
        private Integer seatNumber;
    }
}