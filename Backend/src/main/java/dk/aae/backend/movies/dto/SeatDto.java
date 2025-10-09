package dk.aae.backend.movies.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SeatDto {
    private Long id;
    private Long showId;
    private Integer rowNumber;
    private Integer seatNumber;
    private Boolean isReserved;
    private String seatIdentifier;

    public SeatDto() {}

    public SeatDto(Long id, Long showId, Integer rowNumber, Integer seatNumber, Boolean isReserved) {
        this.id = id;
        this.showId = showId;
        this.rowNumber = rowNumber;
        this.seatNumber = seatNumber;
        this.isReserved = isReserved;
        this.seatIdentifier = "Row " + rowNumber + ", Seat " + seatNumber;
    }
}