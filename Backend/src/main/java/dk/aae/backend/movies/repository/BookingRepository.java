package dk.aae.backend.movies.repository;

import dk.aae.backend.movies.model.Booking;
import dk.aae.backend.movies.model.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    
    List<Booking> findByUserId(Long userId);
    
    List<Booking> findByShowId(Long showId);
    
    List<Booking> findByStatus(BookingStatus status);
    
    List<Booking> findByCustomerEmailContainingIgnoreCase(String email);
    
    List<Booking> findByCustomerNameContainingIgnoreCase(String name);
    
    @Query("SELECT b FROM Booking b WHERE b.show.showDate BETWEEN :startDate AND :endDate")
    List<Booking> findByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT b FROM Booking b WHERE b.show.showDate = :date")
    List<Booking> findByDate(@Param("date") LocalDate date);
    
    @Query("SELECT b FROM Booking b WHERE b.bookingTime BETWEEN :startDateTime AND :endDateTime")
    List<Booking> findByBookingTimeRange(@Param("startDateTime") LocalDateTime startDateTime, 
                                       @Param("endDateTime") LocalDateTime endDateTime);
    
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.show.id = :showId AND b.status = 'CONFIRMED'")
    Integer countConfirmedBookingsByShow(@Param("showId") Long showId);
    
    @Query("SELECT SUM(b.numberOfTickets) FROM Booking b WHERE b.show.id = :showId AND b.status = 'CONFIRMED'")
    Integer countTicketsSoldForShow(@Param("showId") Long showId);
}