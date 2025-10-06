package dk.aae.backend.movies.controller;

import dk.aae.backend.movies.dto.DtoMapper;
import dk.aae.backend.movies.dto.MovieDto;
import dk.aae.backend.movies.dto.UserDto;
import dk.aae.backend.movies.model.Role;
import dk.aae.backend.movies.model.User;
import dk.aae.backend.movies.service.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User userRequest) {
        boolean success = userService.login(userRequest.getEmail(), userRequest.getPassword());
        if (success) {
            return ResponseEntity.ok("Login successful");
        } else {
            return ResponseEntity.status(401).body("Invalid email or password");
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User userRequest) {
        try {
            User savedUser = userService.registerUser(
                    userRequest.getUsername(),
                    userRequest.getEmail(),
                    userRequest.getPassword(),
                    String.valueOf(userRequest.getRole())
            );
                return ResponseEntity.ok(savedUser);
        }   catch (IllegalArgumentException e) {
                return ResponseEntity.status(409).body(e.getMessage());
        }
    }
}
