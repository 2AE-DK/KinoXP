package dk.aae.backend.movies.service;

import dk.aae.backend.movies.dto.MovieDto;
import dk.aae.backend.movies.dto.MovieMapper;
import dk.aae.backend.movies.model.Movie;
import dk.aae.backend.movies.repository.MovieRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.DefaultUriBuilderFactory;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;
import java.util.Optional;

@Service
public class MovieService {

    private final MovieRepository movieRepository;
    private final RestTemplate restTemplate = new RestTemplate();
    private final MovieMapper movieMapper;


    @Value("${omdb.api.key}")
    private String apiKey;

    @Value("${omdb.api.url}")
    private String apiUrl;

    public MovieService(MovieRepository movieRepository, MovieMapper movieMapper) {
        this.movieRepository = movieRepository;
        this.movieMapper = movieMapper;
    }

    public List<Movie> findAll() {
        return movieRepository.findAll();
    }

    // Fetch from DB or OMDb if missing
    public MovieDto findByTitle(String title) {
        Optional<Movie> dbMovie = movieRepository.findByTitle(title);
        if (dbMovie.isPresent()) {
            return movieMapper.toDto(dbMovie.get());
        }

        // Fetch from OMDb/Api
        RestTemplate restTemplate = new RestTemplate();
        restTemplate.setUriTemplateHandler(new DefaultUriBuilderFactory());

        String url = apiUrl + "?apikey={apiKey}&t={title}";
        MovieDto dto = restTemplate.getForObject(url, MovieDto.class, apiKey, title);
        System.out.println(dto);
        if (dto != null) {
            // Map DTO → Entity
            Movie entity = movieMapper.toEntity(dto);

            // Gem i DB
            Movie saved = movieRepository.save(entity);

            // Return DTO til controller
            return movieMapper.toDto(saved);
        }

        throw new RuntimeException("Movie not found");
    }


    public Movie findById(Long id) {
        return movieRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Movie not found"));
    }
}
