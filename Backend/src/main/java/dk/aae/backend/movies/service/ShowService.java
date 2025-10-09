package dk.aae.backend.movies.service;

import dk.aae.backend.movies.dto.*;
import dk.aae.backend.movies.model.*;
import dk.aae.backend.movies.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ShowService {

    @Autowired
    private ShowRepository showRepository;

    @Autowired
    private MovieRepository movieRepository;

    @Autowired
    private TheaterRepository theaterRepository;

    @Autowired
    private SeatRepository seatRepository;

    @Autowired
    private DtoMapper dtoMapper;

    public List<ShowDto> findAll() {
        return showRepository.findAll().stream()
                .map(dtoMapper::toDto)
                .toList();
    }

    public Optional<ShowDto> findById(Long id) {
        return showRepository.findById(id)
                .map(dtoMapper::toDto);
    }

    public List<ShowDto> findByDateRange(LocalDate startDate, LocalDate endDate) {
        return showRepository.findByShowDateBetween(startDate, endDate).stream()
                .map(dtoMapper::toDto)
                .toList();
    }

    public List<ShowDto> findByDate(LocalDate date) {
        return showRepository.findByShowDate(date).stream()
                .map(dtoMapper::toDto)
                .toList();
    }

    public List<ShowDto> findByMovie(Long movieId) {
        return showRepository.findByMovieId(movieId).stream()
                .map(dtoMapper::toDto)
                .toList();
    }

    public List<ShowDto> findByTheater(Long theaterId) {
        return showRepository.findByTheaterId(theaterId).stream()
                .map(dtoMapper::toDto)
                .toList();
    }

    public ShowDto createShow(CreateShowRequest request) {
        Movie movie = movieRepository.findById(request.getMovieId())
                .orElseThrow(() -> new RuntimeException("Movie not found"));
        
        Theater theater = theaterRepository.findById(request.getTheaterId())
                .orElseThrow(() -> new RuntimeException("Theater not found"));

        Show show = new Show(movie, theater, request.getShowDate(), 
                           request.getShowTime(), request.getTicketPrice());
        
        show = showRepository.save(show);
        
        // Create seats for the show
        createSeatsForShow(show, theater);
        
        return dtoMapper.toDto(show);
    }

    public ShowDto updateShow(Long id, CreateShowRequest request) {
        Show show = showRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Show not found"));

        Movie movie = movieRepository.findById(request.getMovieId())
                .orElseThrow(() -> new RuntimeException("Movie not found"));
        
        Theater theater = theaterRepository.findById(request.getTheaterId())
                .orElseThrow(() -> new RuntimeException("Theater not found"));

        show.setMovie(movie);
        show.setTheater(theater);
        show.setShowDate(request.getShowDate());
        show.setShowTime(request.getShowTime());
        show.setTicketPrice(request.getTicketPrice());

        show = showRepository.save(show);
        return dtoMapper.toDto(show);
    }

    public void deleteShow(Long id) {
        if (!showRepository.existsById(id)) {
            throw new RuntimeException("Show not found");
        }
        showRepository.deleteById(id);
    }

    private void createSeatsForShow(Show show, Theater theater) {
        for (int row = 1; row <= theater.getNumberOfRows(); row++) {
            for (int seat = 1; seat <= theater.getSeatsPerRow(); seat++) {
                Seat seatEntity = new Seat(show, row, seat);
                seatRepository.save(seatEntity);
            }
        }
    }

    public List<SeatDto> getAvailableSeats(Long showId) {
        return seatRepository.findAvailableSeatsByShow(showId).stream()
                .map(dtoMapper::toDto)
                .toList();
    }

    public List<SeatDto> getReservedSeats(Long showId) {
        return seatRepository.findReservedSeatsByShow(showId).stream()
                .map(dtoMapper::toDto)
                .toList();
    }
}