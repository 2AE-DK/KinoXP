package dk.aae.backend.movies.repository;

import dk.aae.backend.movies.model.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SeatRepository extends JpaRepository<Seat, Long> {
    
    List<Seat> findByShowId(Long showId);
    
    List<Seat> findByBookingId(Long bookingId);
    
    @Query("SELECT s FROM Seat s WHERE s.show.id = :showId AND s.isReserved = true")
    List<Seat> findReservedSeatsByShow(@Param("showId") Long showId);
    
    @Query("SELECT s FROM Seat s WHERE s.show.id = :showId AND s.isReserved = false")
    List<Seat> findAvailableSeatsByShow(@Param("showId") Long showId);
    
    @Query("SELECT s FROM Seat s WHERE s.show.id = :showId AND s.rowNumber = :rowNumber AND s.seatNumber = :seatNumber")
    Optional<Seat> findByShowAndRowAndSeat(@Param("showId") Long showId, 
                                          @Param("rowNumber") Integer rowNumber, 
                                          @Param("seatNumber") Integer seatNumber);
    
    @Query("SELECT COUNT(s) FROM Seat s WHERE s.show.id = :showId AND s.isReserved = false")
    Integer countAvailableSeatsByShow(@Param("showId") Long showId);
}