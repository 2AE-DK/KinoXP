package dk.aae.backend.movies.dto;

import dk.aae.backend.movies.model.Movie;
import dk.aae.backend.movies.model.User;
import org.springframework.stereotype.Component;

@Component
public class DtoMapper {

    public MovieDto toDto(Movie movie) {
        return new MovieDto(
                movie.getTitle(),
                movie.getYear(),
                movie.getRated(),
                movie.getDirector(),
                movie.getRuntime(),
                movie.getGenre(),
                movie.getActors(),
                movie.getPlot(),
                movie.getLanguage(),
                movie.getImage(),
                movie.getImdbRating(),
                movie.getImdbId()
        );
    }

    public Movie toEntity(MovieDto dto) {
        Movie movie = new Movie();
        movie.setTitle(dto.title());
        movie.setYear(dto.year());
        movie.setRated(dto.rated());
        movie.setDirector(dto.director());
        movie.setRuntime(dto.runtime());
        movie.setGenre(dto.genre());
        movie.setActors(dto.actors());
        movie.setPlot(dto.plot());
        movie.setLanguage(dto.language());
        movie.setImage(dto.image());
        movie.setImdbRating(dto.imdbRating());
        movie.setImdbId(dto.imdbId());
        return movie;
    }

    public UserDto toDto(User user){
        return new UserDto(
                user.getUsername(),
                user.getEmail(),
                user.getRole()
        );
    }

    public User toEntity(UserDto dto) {
        User user = new User();
        user.setEmail(dto.email());
        user.setUsername(dto.username());
        user.setRole(dto.role());
        return user;
    }
}
