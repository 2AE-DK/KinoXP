package dk.aae.backend.movies.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record MovieDto (
    @JsonProperty("Title") String title,
    @JsonProperty("Year") String year,
    @JsonProperty("Rated") String rated,
    @JsonProperty("Director") String director,
    @JsonProperty("Runtime") String runtime,
    @JsonProperty("Genre") String genre,
    @JsonProperty("Actors") String actors,
    @JsonProperty("Plot") String plot,
    @JsonProperty("Language") String language,
    @JsonProperty("Poster") String image,
    @JsonProperty("imdbRating") String imdbRating,
    @JsonProperty("imdbID") String imdbId
) {}
