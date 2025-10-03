package dk.aae.backend.movies.controller;

import dk.aae.backend.movies.dto.ApiSearchMovie;
import dk.aae.backend.movies.dto.MovieDto;
import dk.aae.backend.movies.dto.DtoMapper;
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
    private final DtoMapper dtoMapper;

    @Autowired
    public MovieController(MovieService movieService, DtoMapper dtoMapper) {
        this.movieService = movieService;
        this.dtoMapper = dtoMapper;

    }

    @GetMapping
    public ResponseEntity<List<MovieDto>> findAll() {
        List<MovieDto> dtos = movieService.findAll()
                .stream()
                .map(dtoMapper::toDto)
                .toList();
        return ResponseEntity.ok(dtos);
    }

    //1. Søgefunktion (kun API)
    @GetMapping("/search")
    public ResponseEntity<List<ApiSearchMovie>> searchMovies(@RequestParam String title) {
        List<ApiSearchMovie> movies = movieService.searchMovies(title);
        if (movies.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(movies);
    }

    //2. Henter detaljer om en specifik film, (DB først, ellers API)
    @GetMapping("/{imdbId}")
    public ResponseEntity<MovieDto> getMovieDetails(@PathVariable String imdbId) {
        MovieDto movie = movieService.getMovieDetails(imdbId);
        return ResponseEntity.ok(movie);
    }
}
