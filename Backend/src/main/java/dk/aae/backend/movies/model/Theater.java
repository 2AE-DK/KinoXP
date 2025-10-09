package dk.aae.backend.movies.model;

import dk.aae.backend.common.model.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Entity
@Getter
@Setter
@Table(name = "theaters")
public class Theater extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false)
    private Integer totalSeats;

    @Column(nullable = false)
    private Integer seatsPerRow;

    @Column(nullable = false)
    private Integer numberOfRows;

    @OneToMany(mappedBy = "theater", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Show> shows;

    public Theater() {}

    public Theater(String name, Integer totalSeats, Integer seatsPerRow, Integer numberOfRows) {
        this.name = name;
        this.totalSeats = totalSeats;
        this.seatsPerRow = seatsPerRow;
        this.numberOfRows = numberOfRows;
    }
}