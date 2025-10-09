package dk.aae.backend.movies.repository;

import dk.aae.backend.movies.model.Show;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ShowRepository extends JpaRepository<Show, Long> {
    
    List<Show> findByShowDateBetween(LocalDate startDate, LocalDate endDate);
    
    List<Show> findByShowDate(LocalDate showDate);
    
    List<Show> findByMovieId(Long movieId);
    
    List<Show> findByTheaterId(Long theaterId);
    
    @Query("SELECT s FROM Show s WHERE s.movie.id = :movieId AND s.showDate >= :date ORDER BY s.showDate, s.showTime")
    List<Show> findUpcomingShowsByMovie(@Param("movieId") Long movieId, @Param("date") LocalDate date);
    
    @Query("SELECT s FROM Show s WHERE s.theater.id = :theaterId AND s.showDate = :date ORDER BY s.showTime")
    List<Show> findShowsByTheaterAndDate(@Param("theaterId") Long theaterId, @Param("date") LocalDate date);
}