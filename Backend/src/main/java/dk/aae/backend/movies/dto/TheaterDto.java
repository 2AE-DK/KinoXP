package dk.aae.backend.movies.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TheaterDto {
    private Long id;
    private String name;
    private Integer totalSeats;
    private Integer seatsPerRow;
    private Integer numberOfRows;

    public TheaterDto() {}

    public TheaterDto(Long id, String name, Integer totalSeats, Integer seatsPerRow, Integer numberOfRows) {
        this.id = id;
        this.name = name;
        this.totalSeats = totalSeats;
        this.seatsPerRow = seatsPerRow;
        this.numberOfRows = numberOfRows;
    }
}