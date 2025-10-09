package dk.aae.backend.movies.controller;

import dk.aae.backend.movies.dto.*;
import dk.aae.backend.movies.service.ShowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/shows")
@CrossOrigin(origins = "*")
public class ShowController {

    @Autowired
    private ShowService showService;

    @GetMapping
    public ResponseEntity<List<ShowDto>> getAllShows() {
        List<ShowDto> shows = showService.findAll();
        return ResponseEntity.ok(shows);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ShowDto> getShowById(@PathVariable Long id) {
        return showService.findById(id)
                .map(show -> ResponseEntity.ok(show))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<List<ShowDto>> getShowsByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<ShowDto> shows = showService.findByDate(date);
        return ResponseEntity.ok(shows);
    }

    @GetMapping("/date-range")
    public ResponseEntity<List<ShowDto>> getShowsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<ShowDto> shows = showService.findByDateRange(startDate, endDate);
        return ResponseEntity.ok(shows);
    }

    @GetMapping("/movie/{movieId}")
    public ResponseEntity<List<ShowDto>> getShowsByMovie(@PathVariable Long movieId) {
        List<ShowDto> shows = showService.findByMovie(movieId);
        return ResponseEntity.ok(shows);
    }

    @GetMapping("/theater/{theaterId}")
    public ResponseEntity<List<ShowDto>> getShowsByTheater(@PathVariable Long theaterId) {
        List<ShowDto> shows = showService.findByTheater(theaterId);
        return ResponseEntity.ok(shows);
    }

    @PostMapping
    public ResponseEntity<ShowDto> createShow(@Valid @RequestBody CreateShowRequest request) {
        try {
            ShowDto show = showService.createShow(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(show);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ShowDto> updateShow(@PathVariable Long id, 
                                             @Valid @RequestBody CreateShowRequest request) {
        try {
            ShowDto show = showService.updateShow(id, request);
            return ResponseEntity.ok(show);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteShow(@PathVariable Long id) {
        try {
            showService.deleteShow(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}/seats/available")
    public ResponseEntity<List<SeatDto>> getAvailableSeats(@PathVariable Long id) {
        List<SeatDto> seats = showService.getAvailableSeats(id);
        return ResponseEntity.ok(seats);
    }

    @GetMapping("/{id}/seats/reserved")
    public ResponseEntity<List<SeatDto>> getReservedSeats(@PathVariable Long id) {
        List<SeatDto> seats = showService.getReservedSeats(id);
        return ResponseEntity.ok(seats);
    }
}