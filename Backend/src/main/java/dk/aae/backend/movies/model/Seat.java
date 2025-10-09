package dk.aae.backend.movies.model;

import dk.aae.backend.common.model.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "seats")
public class Seat extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id")
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "show_id", nullable = false)
    private Show show;

    @Column(nullable = false)
    private Integer rowNumber;

    @Column(nullable = false)
    private Integer seatNumber;

    @Column(nullable = false)
    private Boolean isReserved;

    public Seat() {
        this.isReserved = false;
    }

    public Seat(Show show, Integer rowNumber, Integer seatNumber) {
        this();
        this.show = show;
        this.rowNumber = rowNumber;
        this.seatNumber = seatNumber;
    }

    public String getSeatIdentifier() {
        return "Row " + rowNumber + ", Seat " + seatNumber;
    }
}