package dk.aae.backend.movies.model;

import dk.aae.backend.common.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;

@Entity
public class Movie extends BaseEntity {

    private String title;
    @Column(name = "\"year\"")
    private String year;
    private String rated;
    private String director;
    private String runtime;
    private String genre;
    private String actors;
    private String plot;
    private String language;
    private String image;
    private String imdbRating;
    private String imdbId;

    // Constructors
    public Movie() {}

    public Movie(String title, String year, String rated, String director, String runtime, String genre, String actors, String plot, String language, String image, String imdbRating, String imdbId) {
        this.title = title;
        this.year = year;
        this.rated = rated;
        this.director = director;
        this.runtime = runtime;
        this.genre = genre;
        this.actors = actors;
        this.plot = plot;
        this.language = language;
        this.image = image;
        this.imdbRating = imdbRating;
        this.imdbId = imdbId;
    }

    // Getters and Setters
    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getYear() {
        return year;
    }

    public void setYear(String year) {
        this.year = year;
    }

    public String getRated() {
        return rated;
    }

    public void setRated(String rated) {
        this.rated = rated;
    }

    public String getDirector() {
        return director;
    }

    public void setDirector(String director) {
        this.director = director;
    }

    public String getRuntime() {
        return runtime;
    }

    public void setRuntime(String runtime) {
        this.runtime = runtime;
    }

    public String getGenre() {
        return genre;
    }

    public void setGenre(String genre) {
        this.genre = genre;
    }

    public String getActors() {
        return actors;
    }

    public void setActors(String actors) {
        this.actors = actors;
    }

    public String getPlot() {
        return plot;
    }

    public void setPlot(String plot) {
        this.plot = plot;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public String getImdbRating() {
        return imdbRating;
    }

    public void setImdbRating(String imdbRating) {
        this.imdbRating = imdbRating;
    }

    public String getImdbId() {
        return imdbId;
    }

    public void setImdbId(String imdbId) {
        this.imdbId = imdbId;
    }

}
