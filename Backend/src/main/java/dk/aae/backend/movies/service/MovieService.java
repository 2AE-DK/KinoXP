package dk.aae.backend.movies.service;

import dk.aae.backend.movies.dto.ApiSearchMovie;
import dk.aae.backend.movies.dto.ApiSearchResult;
import dk.aae.backend.movies.dto.MovieDto;
import dk.aae.backend.movies.dto.DtoMapper;
import dk.aae.backend.movies.model.Movie;
import dk.aae.backend.movies.repository.MovieRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.DefaultUriBuilderFactory;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class MovieService {

    private final MovieRepository movieRepository;
    private final DtoMapper dtoMapper;
    private final RestTemplate restTemplate = new RestTemplate();


    @Value("${omdb_api_key}")
    private String apiKey;

    @Value("${omdb_api_url}")
    private String apiUrl;

    public MovieService(MovieRepository movieRepository, DtoMapper dtoMapper) {
        this.movieRepository = movieRepository;
        this.dtoMapper = dtoMapper;
    }

    public List<Movie> findAll() {
        return movieRepository.findAll();
    }

    public List<ApiSearchMovie> searchMovies(Map<String, String> params) {

        UriComponentsBuilder builder = UriComponentsBuilder.fromUriString(apiUrl)
                .queryParam("apikey", apiKey);


        params.forEach(builder::queryParam);

        String url = builder.toUriString();

        ApiSearchResult searchResult = restTemplate.getForObject(url, ApiSearchResult.class);

        if (searchResult != null && searchResult.Search() != null) {
            return searchResult.Search();
        }

        return List.of();
    }


    public MovieDto getMovieDetails(String imdbId) {
        //1. Tjek DB
        Optional<Movie> dbMovie = movieRepository.findByImdbId(imdbId);
        if (dbMovie.isPresent()) {
            return dtoMapper.toDto(dbMovie.get());
        }

        //2. Hvis ikke i DB, hent fra API
        String detailUrl = apiUrl + "?apikey={apiKey}&i={imdbId}";
        MovieDto dto = restTemplate.getForObject(detailUrl, MovieDto.class, apiKey, imdbId);

        if (dto != null && dto.title() != null) {
            //Gem i DB
            Movie entity = dtoMapper.toEntity(dto);
            Movie saved = movieRepository.save(entity);
            return dtoMapper.toDto(saved);
        }

        throw new RuntimeException("Movie not found");
    }
}
