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

import java.util.*;

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
        if (!params.containsKey("s") || params.get("s").trim().isEmpty()) {
            return List.of();
        }

        String searchTerm = params.get("s").trim();

        // First, try exact search with the API
        List<ApiSearchMovie> exactResults = searchFromApi(params);

        // If exact search returns few results, try broader searches
        if (exactResults.size() < 5) {
            // Try searching for individual words
            String[] words = searchTerm.split("\\s+");
            List<ApiSearchMovie> allResults = new ArrayList<>(exactResults);

            for (String word : words) {
                if (word.length() > 2) { // Only search words longer than 2 characters
                    Map<String, String> wordParams = new HashMap<>(params);
                    wordParams.put("s", word);
                    List<ApiSearchMovie> wordResults = searchFromApi(wordParams);

                    // Filter results to only include movies that contain the original search term
                    List<ApiSearchMovie> filteredResults = wordResults.stream()
                        .filter(movie -> containsSearchTerm(movie, searchTerm))
                        .toList();

                    allResults.addAll(filteredResults);
                }
            }

            // Remove duplicates based on imdbID
            return allResults.stream()
                .distinct()
                .toList();
        }

        return exactResults;
    }

    private List<ApiSearchMovie> searchFromApi(Map<String, String> params) {
        UriComponentsBuilder builder = UriComponentsBuilder.fromUriString(apiUrl)
                .queryParam("apikey", apiKey);

        Map<String, String> processedParams = new HashMap<>(params);
        if (processedParams.containsKey("s")) {
            String searchTerm = processedParams.get("s");
            searchTerm = searchTerm.trim().replaceAll("\\s+", "+");
            processedParams.put("s", searchTerm);
        }

        processedParams.forEach(builder::queryParam);
        String url = builder.toUriString();

        try {
            ApiSearchResult searchResult = restTemplate.getForObject(url, ApiSearchResult.class);
            if (searchResult != null && searchResult.Search() != null) {
                return searchResult.Search();
            }
        } catch (Exception e) {
            System.err.println("Error searching movies: " + e.getMessage());
        }

        return List.of();
    }

    private boolean containsSearchTerm(ApiSearchMovie movie, String searchTerm) {
        String title = movie.title().toLowerCase();
        String search = searchTerm.toLowerCase();
        return title.contains(search);
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
