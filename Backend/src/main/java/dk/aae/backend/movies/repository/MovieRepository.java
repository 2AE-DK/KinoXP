package dk.aae.backend.movies.repository;

import dk.aae.backend.movies.dto.MovieDto;
import dk.aae.backend.movies.model.Movie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
@Repository
public interface MovieRepository extends JpaRepository<Movie, Long> {
    Optional<Movie> findByImdbId(String imdbId);
    Optional<Movie> findByTitle(String title);

    List<Movie> findMovieByTitleContainingIgnoreCase(String title);
    Optional<Movie> findFirstByTitleContainingIgnoreCaseOrderByTitleAsc(String title);
}
