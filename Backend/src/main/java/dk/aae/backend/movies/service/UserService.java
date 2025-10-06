package dk.aae.backend.movies.service;

import dk.aae.backend.movies.dto.DtoMapper;
import dk.aae.backend.movies.dto.UserDto;
import dk.aae.backend.movies.model.Role;
import dk.aae.backend.movies.model.User;
import dk.aae.backend.movies.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final DtoMapper dtoMapper;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();


    public UserService(UserRepository userRepository, DtoMapper dtoMapper){
        this.userRepository = userRepository;
        this.dtoMapper = dtoMapper;
    }

    public List<User> findAll(){
        return userRepository.findAll();
    }

    public UserDto findByUsername(String username){
        Optional<User> user = userRepository.findByUsername(username);
        if (user.isPresent()){
            return dtoMapper.toDto(user.get());
        }
        throw new RuntimeException("User not found");
    }

    public boolean login(String email, String password){
        return userRepository.findByEmail(email)
                .map(user -> passwordEncoder.matches(password, user.getPassword()))
                .orElse(false);
    }

    public User registerUser(String username, String email, String password, String role) {
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already in use");
        }
        String hashedPassword = passwordEncoder.encode(password);
        User user = new User(username, email, hashedPassword, Role.valueOf(role));
        return userRepository.save(user);
    }


    public UserDto getUserByMail(String email) {
        User user = userRepository.getUserByEmail(email);
        if (user != null){
            return dtoMapper.toDto(user);
        }
        throw new RuntimeException("User not found");
    }

}
