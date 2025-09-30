package dk.aae.backend.movies.controller;

import dk.aae.backend.movies.dto.MovieDto;
import dk.aae.backend.movies.dto.MovieMapper;
import dk.aae.backend.movies.model.Movie;
import dk.aae.backend.movies.service.MovieService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/movies")
public class MovieController {

    private final MovieService movieService;
    private final MovieMapper movieMapper;

    @Autowired
    public MovieController(MovieService movieService, MovieMapper movieMapper) {
        this.movieService = movieService;
        this.movieMapper = movieMapper;

    }

    @GetMapping
    public ResponseEntity<List<MovieDto>> findAll() {
        List<MovieDto> dtos = movieService.findAll()
                .stream()
                .map(movieMapper::toDto)
                .toList();
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MovieDto> findById(@PathVariable Long id) {
        Movie movie = movieService.findById(id);
        return ResponseEntity.ok(movieMapper.toDto(movie));
    }

    @GetMapping("/search")
    public ResponseEntity<MovieDto> findByTitle(@RequestParam(required = false) String title) {
        MovieDto movie = movieService.findByTitle(title);
        return ResponseEntity.ok(movie);
    }
}
