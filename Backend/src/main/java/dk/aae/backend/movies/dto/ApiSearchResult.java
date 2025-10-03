package dk.aae.backend.movies.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record ApiSearchResult(
        @JsonProperty("Search") List<ApiSearchMovie> Search,
        @JsonProperty("totalResults") String totalResults,
        @JsonProperty("Response") String response
) { }
