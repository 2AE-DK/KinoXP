package dk.aae.backend.movies.dto;

import dk.aae.backend.movies.model.Role;

public record UserDto (
    String username,
    String email,
    Role role
) {}
