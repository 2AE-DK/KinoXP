package dk.aae.backend.movies.service;

import dk.aae.backend.movies.dto.DtoMapper;
import dk.aae.backend.movies.dto.UserDto;
import dk.aae.backend.movies.model.User;
import dk.aae.backend.movies.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final DtoMapper dtoMapper;

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
}
