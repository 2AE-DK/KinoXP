package dk.aae.backend.common.data;

import dk.aae.backend.movies.model.*;
import dk.aae.backend.movies.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalTime;

@Component
public class InitData implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MovieRepository movieRepository;

    @Autowired
    private TheaterRepository theaterRepository;

    @Autowired
    private ShowRepository showRepository;

    @Autowired
    private SeatRepository seatRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Override
    public void run(String... args) throws Exception {
        initializeData();
    }

    private void initializeData() {
        // Create sample theaters
        if (theaterRepository.count() == 0) {
            Theater theater1 = new Theater("Main Theater", 100, 10, 10);
            Theater theater2 = new Theater("Small Theater", 50, 10, 5);
            Theater theater3 = new Theater("IMAX Theater", 200, 20, 10);
            
            theaterRepository.save(theater1);
            theaterRepository.save(theater2);
            theaterRepository.save(theater3);
        }

        // Create sample users if needed
        if (userRepository.count() == 0) {
            User adminUser = new User("admin", "admin@cinema.com", "password123", Role.ADMIN);
            User regularUser = new User("user", "user@cinema.com", "password123", Role.USER);
            
            userRepository.save(adminUser);
            userRepository.save(regularUser);
        }

        // Create sample movies if needed
        if (movieRepository.count() == 0) {
            Movie movie1 = new Movie("The Matrix", "1999", "R", "The Wachowskis", "136 min", 
                    "Action, Sci-Fi", "Keanu Reeves, Laurence Fishburne", 
                    "A computer hacker learns about the true nature of reality.", 
                    "English", "matrix.jpg", "8.7", "tt0133093");
            
            Movie movie2 = new Movie("Inception", "2010", "PG-13", "Christopher Nolan", "148 min",
                    "Action, Drama, Sci-Fi", "Leonardo DiCaprio, Marion Cotillard",
                    "A thief enters people's dreams to steal secrets.",
                    "English", "inception.jpg", "8.8", "tt1375666");
            
            movieRepository.save(movie1);
            movieRepository.save(movie2);
        }

        // Create sample shows if needed
        if (showRepository.count() == 0) {
            var theaters = theaterRepository.findAll();
            var movies = movieRepository.findAll();
            
            if (!theaters.isEmpty() && !movies.isEmpty()) {
                Theater mainTheater = theaters.get(0);
                Movie matrix = movies.get(0);
                Movie inception = movies.size() > 1 ? movies.get(1) : movies.get(0);
                
                // Create shows for today and tomorrow
                LocalDate today = LocalDate.now();
                LocalDate tomorrow = today.plusDays(1);
                
                Show show1 = new Show(matrix, mainTheater, today, LocalTime.of(19, 30), 12.50);
                Show show2 = new Show(inception, mainTheater, today, LocalTime.of(22, 00), 15.00);
                Show show3 = new Show(matrix, mainTheater, tomorrow, LocalTime.of(19, 30), 12.50);
                Show show4 = new Show(inception, mainTheater, tomorrow, LocalTime.of(22, 00), 15.00);
                
                showRepository.save(show1);
                showRepository.save(show2);
                showRepository.save(show3);
                showRepository.save(show4);
                
                // Create seats for each show
                createSeatsForShow(show1, mainTheater);
                createSeatsForShow(show2, mainTheater);
                createSeatsForShow(show3, mainTheater);
                createSeatsForShow(show4, mainTheater);
            }
        }
    }

    private void createSeatsForShow(Show show, Theater theater) {
        for (int row = 1; row <= theater.getNumberOfRows(); row++) {
            for (int seat = 1; seat <= theater.getSeatsPerRow(); seat++) {
                Seat seatEntity = new Seat(show, row, seat);
                seatRepository.save(seatEntity);
            }
        }
    }
}
