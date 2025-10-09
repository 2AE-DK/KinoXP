package dk.aae.backend.movies.dto;

import dk.aae.backend.movies.model.*;
import dk.aae.backend.movies.repository.SeatRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class DtoMapper {

    @Autowired
    private SeatRepository seatRepository;

    public MovieDto toDto(Movie movie) {
        return new MovieDto(
                movie.getTitle(),
                movie.getYear(),
                movie.getRated(),
                movie.getDirector(),
                movie.getRuntime(),
                movie.getGenre(),
                movie.getActors(),
                movie.getPlot(),
                movie.getLanguage(),
                movie.getImage(),
                movie.getImdbRating(),
                movie.getImdbId()
        );
    }

    public Movie toEntity(MovieDto dto) {
        Movie movie = new Movie();
        movie.setTitle(dto.title());
        movie.setYear(dto.year());
        movie.setRated(dto.rated());
        movie.setDirector(dto.director());
        movie.setRuntime(dto.runtime());
        movie.setGenre(dto.genre());
        movie.setActors(dto.actors());
        movie.setPlot(dto.plot());
        movie.setLanguage(dto.language());
        movie.setImage(dto.image());
        movie.setImdbRating(dto.imdbRating());
        movie.setImdbId(dto.imdbId());
        return movie;
    }

    public UserDto toDto(User user){
        return new UserDto(
                user.getUsername(),
                user.getEmail(),
                user.getRole()
        );
    }

    // Show mappings
    public ShowDto toDto(Show show) {
        Integer availableSeats = seatRepository.countAvailableSeatsByShow(show.getId());
        return new ShowDto(
                show.getId(),
                show.getMovie().getId(),
                show.getMovie().getTitle(),
                show.getTheater().getId(),
                show.getTheater().getName(),
                show.getShowDate(),
                show.getShowTime(),
                show.getTicketPrice(),
                availableSeats != null ? availableSeats : 0
        );
    }

    // Theater mappings
    public TheaterDto toDto(Theater theater) {
        return new TheaterDto(
                theater.getId(),
                theater.getName(),
                theater.getTotalSeats(),
                theater.getSeatsPerRow(),
                theater.getNumberOfRows()
        );
    }

    public Theater toEntity(TheaterDto dto) {
        Theater theater = new Theater();
        theater.setName(dto.getName());
        theater.setTotalSeats(dto.getTotalSeats());
        theater.setSeatsPerRow(dto.getSeatsPerRow());
        theater.setNumberOfRows(dto.getNumberOfRows());
        return theater;
    }

    // Booking mappings
    public BookingDto toDto(Booking booking) {
        List<SeatDto> seatDtos = booking.getSeats().stream()
                .map(this::toDto)
                .collect(Collectors.toList());

        return new BookingDto(
                booking.getId(),
                booking.getUser().getId(),
                booking.getUser().getUsername(),
                booking.getShow().getId(),
                booking.getShow().getMovie().getTitle(),
                booking.getShow().getTheater().getName(),
                booking.getShow().getShowDate(),
                booking.getShow().getShowTime(),
                booking.getCustomerName(),
                booking.getCustomerEmail(),
                booking.getCustomerPhone(),
                booking.getNumberOfTickets(),
                booking.getTotalPrice(),
                booking.getStatus(),
                booking.getBookingTime(),
                seatDtos
        );
    }

    // Seat mappings
    public SeatDto toDto(Seat seat) {
        return new SeatDto(
                seat.getId(),
                seat.getShow().getId(),
                seat.getRowNumber(),
                seat.getSeatNumber(),
                seat.getIsReserved()
        );
    }

}
