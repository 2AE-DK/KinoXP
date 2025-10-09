package dk.aae.backend.movies.service;

import dk.aae.backend.movies.dto.TheaterDto;
import dk.aae.backend.movies.model.Theater;
import dk.aae.backend.movies.repository.TheaterRepository;
import dk.aae.backend.movies.dto.DtoMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class TheaterService {

    @Autowired
    private TheaterRepository theaterRepository;

    @Autowired
    private DtoMapper dtoMapper;

    public List<TheaterDto> findAll() {
        return theaterRepository.findAll().stream()
                .map(dtoMapper::toDto)
                .toList();
    }

    public Optional<TheaterDto> findById(Long id) {
        return theaterRepository.findById(id)
                .map(dtoMapper::toDto);
    }

    public Optional<TheaterDto> findByName(String name) {
        return theaterRepository.findByName(name)
                .map(dtoMapper::toDto);
    }

    public TheaterDto createTheater(TheaterDto theaterDto) {
        if (theaterRepository.existsByName(theaterDto.getName())) {
            throw new RuntimeException("Theater with this name already exists");
        }

        Theater theater = dtoMapper.toEntity(theaterDto);
        theater = theaterRepository.save(theater);
        return dtoMapper.toDto(theater);
    }

    public TheaterDto updateTheater(Long id, TheaterDto theaterDto) {
        Theater theater = theaterRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Theater not found"));

        if (!theater.getName().equals(theaterDto.getName()) && 
            theaterRepository.existsByName(theaterDto.getName())) {
            throw new RuntimeException("Theater with this name already exists");
        }

        theater.setName(theaterDto.getName());
        theater.setTotalSeats(theaterDto.getTotalSeats());
        theater.setSeatsPerRow(theaterDto.getSeatsPerRow());
        theater.setNumberOfRows(theaterDto.getNumberOfRows());

        theater = theaterRepository.save(theater);
        return dtoMapper.toDto(theater);
    }

    public void deleteTheater(Long id) {
        if (!theaterRepository.existsById(id)) {
            throw new RuntimeException("Theater not found");
        }
        theaterRepository.deleteById(id);
    }
}