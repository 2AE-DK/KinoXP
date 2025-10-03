package dk.aae.backend.movies.controller;

import dk.aae.backend.movies.dto.DtoMapper;
import dk.aae.backend.movies.dto.MovieDto;
import dk.aae.backend.movies.dto.UserDto;
import dk.aae.backend.movies.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final DtoMapper dtoMapper;

    public UserController(UserService userService, DtoMapper dtoMapper) {
        this.userService = userService;
        this.dtoMapper = dtoMapper;
    }

    @GetMapping
    public ResponseEntity<List<UserDto>> findAll() {
        List<UserDto> dtos = userService.findAll()
                .stream()
                .map(dtoMapper::toDto)
                .toList();
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/search")
    public ResponseEntity<UserDto> findByUsername(@RequestParam(required = false) String username) {
        UserDto user = userService.findByUsername(username);
        return ResponseEntity.ok(user);
    }
}
