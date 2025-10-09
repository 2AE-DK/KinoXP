package dk.aae.backend.movies.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
public class ShowDto {
    private Long id;
    private Long movieId;
    private String movieTitle;
    private Long theaterId;
    private String theaterName;
    private LocalDate showDate;
    private LocalTime showTime;
    private Double ticketPrice;
    private Integer availableSeats;

    public ShowDto() {}

    public ShowDto(Long id, Long movieId, String movieTitle, Long theaterId, String theaterName,
                   LocalDate showDate, LocalTime showTime, Double ticketPrice, Integer availableSeats) {
        this.id = id;
        this.movieId = movieId;
        this.movieTitle = movieTitle;
        this.theaterId = theaterId;
        this.theaterName = theaterName;
        this.showDate = showDate;
        this.showTime = showTime;
        this.ticketPrice = ticketPrice;
        this.availableSeats = availableSeats;
    }
}