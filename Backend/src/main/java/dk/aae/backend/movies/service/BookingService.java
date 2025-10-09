package dk.aae.backend.movies.service;

import dk.aae.backend.movies.dto.*;
import dk.aae.backend.movies.model.*;
import dk.aae.backend.movies.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private ShowRepository showRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SeatRepository seatRepository;

    @Autowired
    private DtoMapper dtoMapper;

    public List<BookingDto> findAll() {
        return bookingRepository.findAll().stream()
                .map(dtoMapper::toDto)
                .toList();
    }

    public Optional<BookingDto> findById(Long id) {
        return bookingRepository.findById(id)
                .map(dtoMapper::toDto);
    }

    public List<BookingDto> findByUser(Long userId) {
        return bookingRepository.findByUserId(userId).stream()
                .map(dtoMapper::toDto)
                .toList();
    }

    public List<BookingDto> findByShow(Long showId) {
        return bookingRepository.findByShowId(showId).stream()
                .map(dtoMapper::toDto)
                .toList();
    }

    public List<BookingDto> findByDateRange(LocalDate startDate, LocalDate endDate) {
        return bookingRepository.findByDateRange(startDate, endDate).stream()
                .map(dtoMapper::toDto)
                .toList();
    }

    public List<BookingDto> findByDate(LocalDate date) {
        return bookingRepository.findByDate(date).stream()
                .map(dtoMapper::toDto)
                .toList();
    }

    public List<BookingDto> searchByCustomerEmail(String email) {
        return bookingRepository.findByCustomerEmailContainingIgnoreCase(email).stream()
                .map(dtoMapper::toDto)
                .toList();
    }

    public List<BookingDto> searchByCustomerName(String name) {
        return bookingRepository.findByCustomerNameContainingIgnoreCase(name).stream()
                .map(dtoMapper::toDto)
                .toList();
    }

    public BookingDto createBooking(Long userId, CreateBookingRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Show show = showRepository.findById(request.getShowId())
                .orElseThrow(() -> new RuntimeException("Show not found"));

        // Validate seat availability
        validateSeatAvailability(request.getShowId(), request.getSeats());

        // Calculate total price
        Double totalPrice = request.getNumberOfTickets() * show.getTicketPrice();

        // Create booking
        Booking booking = new Booking(user, show, request.getCustomerName(),
                request.getCustomerEmail(), request.getCustomerPhone(),
                request.getNumberOfTickets(), totalPrice);

        booking = bookingRepository.save(booking);

        // Reserve seats
        reserveSeats(booking, request.getSeats());

        return dtoMapper.toDto(booking);
    }

    public BookingDto updateBooking(Long id, UpdateBookingRequest request) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new RuntimeException("Cannot update cancelled booking");
        }

        // If seats are being changed, validate availability
        if (request.getSeats() != null && !request.getSeats().isEmpty()) {
            // Free current seats
            freeSeats(booking);
            
            // Validate new seat availability
            validateSeatAvailability(booking.getShow().getId(), request.getSeats());
            
            // Reserve new seats
            reserveSeats(booking, request.getSeats());
        }

        // Update booking details
        booking.setCustomerName(request.getCustomerName());
        booking.setCustomerEmail(request.getCustomerEmail());
        booking.setCustomerPhone(request.getCustomerPhone());
        booking.setNumberOfTickets(request.getNumberOfTickets());
        
        // Recalculate price
        Double totalPrice = request.getNumberOfTickets() * booking.getShow().getTicketPrice();
        booking.setTotalPrice(totalPrice);

        booking = bookingRepository.save(booking);
        return dtoMapper.toDto(booking);
    }

    public void cancelBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new RuntimeException("Booking is already cancelled");
        }

        // Free seats
        freeSeats(booking);

        // Update status
        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);
    }

    public void completeBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new RuntimeException("Cannot complete cancelled booking");
        }

        booking.setStatus(BookingStatus.COMPLETED);
        bookingRepository.save(booking);
    }

    private void validateSeatAvailability(Long showId, List<CreateBookingRequest.SeatSelection> seatSelections) {
        for (CreateBookingRequest.SeatSelection seatSelection : seatSelections) {
            Optional<Seat> seat = seatRepository.findByShowAndRowAndSeat(
                    showId, seatSelection.getRowNumber(), seatSelection.getSeatNumber());
            
            if (seat.isEmpty()) {
                throw new RuntimeException("Seat not found: Row " + seatSelection.getRowNumber() + 
                                         ", Seat " + seatSelection.getSeatNumber());
            }
            
            if (seat.get().getIsReserved()) {
                throw new RuntimeException("Seat is already reserved: Row " + seatSelection.getRowNumber() + 
                                         ", Seat " + seatSelection.getSeatNumber());
            }
        }
    }

    private void reserveSeats(Booking booking, List<CreateBookingRequest.SeatSelection> seatSelections) {
        for (CreateBookingRequest.SeatSelection seatSelection : seatSelections) {
            Seat seat = seatRepository.findByShowAndRowAndSeat(
                    booking.getShow().getId(), seatSelection.getRowNumber(), seatSelection.getSeatNumber())
                    .orElseThrow(() -> new RuntimeException("Seat not found"));
            
            seat.setBooking(booking);
            seat.setIsReserved(true);
            seatRepository.save(seat);
        }
    }

    private void freeSeats(Booking booking) {
        List<Seat> seats = seatRepository.findByBookingId(booking.getId());
        for (Seat seat : seats) {
            seat.setBooking(null);
            seat.setIsReserved(false);
            seatRepository.save(seat);
        }
    }

    // Calendar and statistics methods
    public List<BookingDto> getBookingsByWeek(LocalDate startOfWeek) {
        LocalDate endOfWeek = startOfWeek.plusDays(6);
        return findByDateRange(startOfWeek, endOfWeek);
    }

    public List<BookingDto> getBookingsByMonth(int year, int month) {
        LocalDate startOfMonth = LocalDate.of(year, month, 1);
        LocalDate endOfMonth = startOfMonth.withDayOfMonth(startOfMonth.lengthOfMonth());
        return findByDateRange(startOfMonth, endOfMonth);
    }

    public Integer getTicketsSoldForShow(Long showId) {
        Integer ticketsSold = bookingRepository.countTicketsSoldForShow(showId);
        return ticketsSold != null ? ticketsSold : 0;
    }
}