package dk.aae.backend.movies.controller;

import dk.aae.backend.movies.dto.TheaterDto;
import dk.aae.backend.movies.service.TheaterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/theaters")
@CrossOrigin(origins = "*")
public class TheaterController {

    @Autowired
    private TheaterService theaterService;

    @GetMapping
    public ResponseEntity<List<TheaterDto>> getAllTheaters() {
        List<TheaterDto> theaters = theaterService.findAll();
        return ResponseEntity.ok(theaters);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TheaterDto> getTheaterById(@PathVariable Long id) {
        return theaterService.findById(id)
                .map(theater -> ResponseEntity.ok(theater))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/name/{name}")
    public ResponseEntity<TheaterDto> getTheaterByName(@PathVariable String name) {
        return theaterService.findByName(name)
                .map(theater -> ResponseEntity.ok(theater))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<TheaterDto> createTheater(@Valid @RequestBody TheaterDto theaterDto) {
        try {
            TheaterDto theater = theaterService.createTheater(theaterDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(theater);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<TheaterDto> updateTheater(@PathVariable Long id, 
                                                   @Valid @RequestBody TheaterDto theaterDto) {
        try {
            TheaterDto theater = theaterService.updateTheater(id, theaterDto);
            return ResponseEntity.ok(theater);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTheater(@PathVariable Long id) {
        try {
            theaterService.deleteTheater(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}