package dk.aae.backend.movies.repository;

import dk.aae.backend.movies.model.Theater;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TheaterRepository extends JpaRepository<Theater, Long> {
    
    Optional<Theater> findByName(String name);
    
    boolean existsByName(String name);
}