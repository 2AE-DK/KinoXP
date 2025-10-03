package dk.aae.backend.movies.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record ApiSearchMovie(
        @JsonProperty("Title") String title,
        @JsonProperty("Year") String year,
        @JsonProperty("imdbID") String imdbId,
        @JsonProperty("Type") String type,
        @JsonProperty("Poster") String poster
) {}
