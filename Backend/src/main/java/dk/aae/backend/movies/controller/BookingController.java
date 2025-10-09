package dk.aae.backend.movies.controller;

import dk.aae.backend.movies.dto.*;
import dk.aae.backend.movies.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @GetMapping
    public ResponseEntity<List<BookingDto>> getAllBookings() {
        List<BookingDto> bookings = bookingService.findAll();
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingDto> getBookingById(@PathVariable Long id) {
        return bookingService.findById(id)
                .map(booking -> ResponseEntity.ok(booking))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<BookingDto>> getBookingsByUser(@PathVariable Long userId) {
        List<BookingDto> bookings = bookingService.findByUser(userId);
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/show/{showId}")
    public ResponseEntity<List<BookingDto>> getBookingsByShow(@PathVariable Long showId) {
        List<BookingDto> bookings = bookingService.findByShow(showId);
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<List<BookingDto>> getBookingsByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<BookingDto> bookings = bookingService.findByDate(date);
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/date-range")
    public ResponseEntity<List<BookingDto>> getBookingsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<BookingDto> bookings = bookingService.findByDateRange(startDate, endDate);
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/search/email")
    public ResponseEntity<List<BookingDto>> searchByCustomerEmail(@RequestParam String email) {
        List<BookingDto> bookings = bookingService.searchByCustomerEmail(email);
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/search/name")
    public ResponseEntity<List<BookingDto>> searchByCustomerName(@RequestParam String name) {
        List<BookingDto> bookings = bookingService.searchByCustomerName(name);
        return ResponseEntity.ok(bookings);
    }

    @PostMapping("/user/{userId}")
    public ResponseEntity<BookingDto> createBooking(@PathVariable Long userId,
                                                   @Valid @RequestBody CreateBookingRequest request) {
        try {
            BookingDto booking = bookingService.createBooking(userId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(booking);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<BookingDto> updateBooking(@PathVariable Long id,
                                                   @Valid @RequestBody UpdateBookingRequest request) {
        try {
            BookingDto booking = bookingService.updateBooking(id, request);
            return ResponseEntity.ok(booking);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<Void> cancelBooking(@PathVariable Long id) {
        try {
            bookingService.cancelBooking(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<Void> completeBooking(@PathVariable Long id) {
        try {
            bookingService.completeBooking(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Calendar endpoints
    @GetMapping("/calendar/week")
    public ResponseEntity<List<BookingDto>> getBookingsByWeek(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startOfWeek) {
        List<BookingDto> bookings = bookingService.getBookingsByWeek(startOfWeek);
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/calendar/month")
    public ResponseEntity<List<BookingDto>> getBookingsByMonth(
            @RequestParam int year, @RequestParam int month) {
        List<BookingDto> bookings = bookingService.getBookingsByMonth(year, month);
        return ResponseEntity.ok(bookings);
    }

    // Statistics endpoint
    @GetMapping("/show/{showId}/tickets-sold")
    public ResponseEntity<Integer> getTicketsSoldForShow(@PathVariable Long showId) {
        Integer ticketsSold = bookingService.getTicketsSoldForShow(showId);
        return ResponseEntity.ok(ticketsSold);
    }
}