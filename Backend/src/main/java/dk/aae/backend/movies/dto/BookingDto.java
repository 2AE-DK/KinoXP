package dk.aae.backend.movies.dto;

import dk.aae.backend.movies.model.BookingStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Getter
@Setter
public class BookingDto {
    private Long id;
    private Long userId;
    private String username;
    private Long showId;
    private String movieTitle;
    private String theaterName;
    private LocalDate showDate;
    private LocalTime showTime;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private Integer numberOfTickets;
    private Double totalPrice;
    private BookingStatus status;
    private LocalDateTime bookingTime;
    private List<SeatDto> seats;

    public BookingDto() {}

    public BookingDto(Long id, Long userId, String username, Long showId, String movieTitle,
                      String theaterName, LocalDate showDate, LocalTime showTime,
                      String customerName, String customerEmail, String customerPhone,
                      Integer numberOfTickets, Double totalPrice, BookingStatus status,
                      LocalDateTime bookingTime, List<SeatDto> seats) {
        this.id = id;
        this.userId = userId;
        this.username = username;
        this.showId = showId;
        this.movieTitle = movieTitle;
        this.theaterName = theaterName;
        this.showDate = showDate;
        this.showTime = showTime;
        this.customerName = customerName;
        this.customerEmail = customerEmail;
        this.customerPhone = customerPhone;
        this.numberOfTickets = numberOfTickets;
        this.totalPrice = totalPrice;
        this.status = status;
        this.bookingTime = bookingTime;
        this.seats = seats;
    }
}