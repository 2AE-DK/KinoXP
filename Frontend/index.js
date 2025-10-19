


/*
 * KinoXP Frontend - Movie Discovery Application
 * 
 * OMDb API Integration:
 * This application uses the OMDb API through a Spring Boot backend with the following parameters:
 * 
 * Search Parameters:
 * - s: Movie title to search for (Required)
 * - type: movie, series, episode (Optional, defaults to 'movie')
 * - y: Year of release (Optional)
 * - page: Page number 1-100 (Optional, defaults to 1)
 * - r: Response format json/xml (Optional, defaults to json)
 * 
 * Movie Categories:
 * - 🔥 Most Trending: Popular franchises and series (type: movie)
 * - 🆕 New Releases: Movies from 2025 only (y: 2025, type: movie)
 * - ⭐ Acclaimed Classics: Well-known classic films (type: movie)
 */

const content = document.getElementById('content');
document.addEventListener('DOMContentLoaded', init);

// Store last search state
let lastSearchTerm = '';
let lastSearchResults = [];


function init(){
  setupRouting();
  setupLogo();
  setupAuthButtons();
  handleInitialRoute();
}

// Setup browser history and URL routing
function setupRouting() {
  window.addEventListener('popstate', (event) => {
    handleRoute(event.state);
  });
}

// Handle initial page load route
function handleInitialRoute() {
  const urlParams = new URLSearchParams(window.location.search);
  const searchQuery = urlParams.get('search');
  const movieId = urlParams.get('movie');
  const page = urlParams.get('page');
  
  if (movieId) {
    // Load movie details
    const movieTitle = urlParams.get('title') || 'Unknown Movie';
    viewMovieDetails(movieId, movieTitle);
  } else if (searchQuery) {
    // Perform search
    searchMovies(searchQuery);
  } else if (page === 'movies') {
    // Load movies page
    renderMoviePage();
  } else {
    // Default to home page
    renderHomePage();
  }
}

// Update URL without reloading page
function updateURL(path, state = null) {
  const url = window.location.origin + window.location.pathname + path;
  window.history.pushState(state, '', url);
}

// Handle route changes
function handleRoute(state) {
  if (state) {
    if (state.type === 'search' && state.term) {
      searchMovies(state.term);
    } else if (state.type === 'movie' && state.movieId) {
      viewMovieDetails(state.movieId, state.title);
    } else if (state.type === 'movies') {
      renderMoviePage();
    } else {
      renderHomePage();
    }
  } else {
    handleInitialRoute();
  }
}

function setupLogo() {
  const logo = document.querySelector('.logo');
  if (logo) {
    logo.addEventListener('click', () => {
      updateURL('', { type: 'home' });
      renderHomePage();
    });
  }
}



function renderHomePage() {
  // Update URL to home
  if (window.location.search) {
    updateURL('', { type: 'home' });
  }
  
  content.innerHTML = `
    <div class="header">
      <h1>Watch Your Favorite Movie</h1>
      <p>
        Welcome to our cinema, where every visit becomes an unforgettable experience.<br>
        Discover our upcoming movies, reserve your seats with ease,<br>
        and enjoy the perfect atmosphere for your next night out at the movies.
      </p>
    </div>

    <div>
      <button class="button" id="viewMoviesBtn">View movies</button>
    </div>

    <div class="search-container">
      <input type="text" placeholder="Search for a movie..." class="search-bar"
      id="searchMoviesField">
    </div>
  `;

  const viewMovies = document.getElementById('viewMoviesBtn')
  viewMovies.addEventListener("click", renderMoviePage)
  const searchMovies = document.getElementById('searchMoviesField')
  searchMovies.addEventListener("input", handleSearchMovies)
}

async function renderMoviePage(){
  try {
    // Update URL for movies page
    updateURL('?page=movies', { type: 'movies' });

    content.innerHTML = `
      <div class="movies-page-container">
        <div class="header">
          <h1>Discover Movies</h1>
          <p>Explore trending movies and new releases</p>
        </div>

        <div class="movie-slider-section">
          <h2 class="slider-title">🔥 Most Trending</h2>
          <div class="movie-slider" id="trending-slider">
            <div class="slider-loading">Loading trending movies...</div>
          </div>
        </div>

        <div class="movie-slider-section">
          <h2 class="slider-title">🆕 New Releases</h2>
          <div class="movie-slider" id="new-releases-slider">
            <div class="slider-loading">Loading new releases...</div>
          </div>
        </div>

        <div class="movie-slider-section">
          <h2 class="slider-title">⭐ Popular Classics</h2>
          <div class="movie-slider" id="popular-slider">
            <div class="slider-loading">Loading popular movies...</div>
          </div>
        </div>

        <div class="movies-page-actions">
          <button class="button" id="backToHomeBtn">Back to Home</button>
        </div>
      </div>
    `;

    // Add event listener for back button
    const backBtn = document.getElementById('backToHomeBtn');
    backBtn.addEventListener("click", () => {
      updateURL('', { type: 'home' });
      renderHomePage();
    });

    // Load movie data for sliders
    await loadMovieSliders();

  } catch (error) {
    console.error('Error rendering movie page:', error);
    content.innerHTML = `
      <div class="header">
        <h1>Error Loading Movies</h1>
        <p>Sorry, we couldn't load the movies page.</p>
      </div>
      <div>
        <button class="button" id="backToHomeBtn">Back to Home</button>
      </div>
    `;
    
    const backBtn = document.getElementById('backToHomeBtn');
    backBtn.addEventListener("click", () => {
      updateURL('', { type: 'home' });
      renderHomePage();
    });
  }
}

// Load movie data for all sliders
async function loadMovieSliders() {
  try {
    // Load trending/popular movies (movies only, with posters preferred)
    const trendingPromise = loadTrendingMovies();

    // Load new releases (2025 movies only)
    const newReleasesPromise = loadNewReleaseMovies();

    // Load acclaimed classics (older acclaimed movies)
    const classicsPromise = loadClassicMovies();

    // Load all sliders concurrently
    await Promise.all([trendingPromise, newReleasesPromise, classicsPromise]);

  } catch (error) {
    console.error('Error loading movie sliders:', error);
  }
}

// Load trending movies using popular search terms
async function loadTrendingMovies() {
  const sliderId = 'trending-slider';
  const title = '🔥 Most Trending';
  
  try {
    const trendingQueries = [
      { s: 'avengers', type: 'movie' },
      { s: 'batman', type: 'movie' },
      { s: 'spider', type: 'movie' },
      { s: 'marvel', type: 'movie' },
      { s: 'star wars', type: 'movie' }
    ];
    
    const allMovies = [];
    
    // Fetch movies for each trending query
    for (const queryParams of trendingQueries) {
      try {
        const movies = await fetchMoviesWithParams(queryParams);
        allMovies.push(...movies.slice(0, 4)); // Take top 4 from each query
      } catch (error) {
        console.error(`Error fetching trending movies for query:`, queryParams, error);
      }
    }

    // Remove duplicates and prioritize movies with posters
    const uniqueMovies = removeDuplicatesAndSort(allMovies, 'trending');
    renderMovieSlider(sliderId, uniqueMovies.slice(0, 10), title);

  } catch (error) {
    console.error('Error loading trending movies:', error);
    document.getElementById(sliderId).innerHTML = `<div class="slider-error">Failed to load trending movies</div>`;
  }
}

// Load new release movies (2025 only)
async function loadNewReleaseMovies() {
  const sliderId = 'new-releases-slider';
  const title = '🆕 New Releases';
  
  try {
    const currentYear = 2025; // Fixed to 2025 as requested
    const newReleaseQueries = [
      { s: 'movie', type: 'movie', y: currentYear.toString() },
      { s: 'action', type: 'movie', y: currentYear.toString() },
      { s: 'drama', type: 'movie', y: currentYear.toString() },
      { s: 'comedy', type: 'movie', y: currentYear.toString() },
      { s: 'thriller', type: 'movie', y: currentYear.toString() }
    ];
    
    const allMovies = [];
    
    // Fetch movies for 2025 only
    for (const queryParams of newReleaseQueries) {
      try {
        const movies = await fetchMoviesWithParams(queryParams);
        // Filter to ensure only 2025 movies
        const filteredMovies = movies.filter(movie => movie.Year === currentYear.toString());
        allMovies.push(...filteredMovies.slice(0, 5));
      } catch (error) {
        console.error(`Error fetching new releases for query:`, queryParams, error);
      }
    }

    // If no 2025 movies found, try broader search
    if (allMovies.length === 0) {
      console.log('No 2025 movies found, trying broader search...');
      const broadQueries = [
        { s: 'new', type: 'movie', y: currentYear.toString() },
        { s: 'latest', type: 'movie', y: currentYear.toString() }
      ];
      
      for (const queryParams of broadQueries) {
        try {
          const movies = await fetchMoviesWithParams(queryParams);
          const filteredMovies = movies.filter(movie => movie.Year === currentYear.toString());
          allMovies.push(...filteredMovies);
        } catch (error) {
          console.error(`Error in broad search:`, error);
        }
      }
    }

    // Remove duplicates and sort by year (newest first)
    const uniqueMovies = removeDuplicatesAndSort(allMovies, 'recent');
    
    if (uniqueMovies.length === 0) {
      document.getElementById(sliderId).innerHTML = `
        <div class="slider-error">No 2025 movies found. Try adjusting search criteria.</div>
      `;
    } else {
      renderMovieSlider(sliderId, uniqueMovies.slice(0, 10), title);
    }

  } catch (error) {
    console.error('Error loading new releases:', error);
    document.getElementById(sliderId).innerHTML = `<div class="slider-error">Failed to load new releases</div>`;
  }
}

// Load classic acclaimed movies
async function loadClassicMovies() {
  const sliderId = 'popular-slider';
  const title = '⭐ Acclaimed Classics';
  
  try {
    const classicQueries = [
      { s: 'godfather', type: 'movie' },
      { s: 'shawshank', type: 'movie' },
      { s: 'dark knight', type: 'movie' },
      { s: 'pulp fiction', type: 'movie' },
      { s: 'inception', type: 'movie' },
      { s: 'goodfellas', type: 'movie' },
      { s: 'casablanca', type: 'movie' }
    ];
    
    const allMovies = [];
    
    // Fetch classic movies
    for (const queryParams of classicQueries) {
      try {
        const movies = await fetchMoviesWithParams(queryParams);
        allMovies.push(...movies.slice(0, 3)); // Take top 3 from each query
      } catch (error) {
        console.error(`Error fetching classics for query:`, queryParams, error);
      }
    }

    // Remove duplicates and sort
    const uniqueMovies = removeDuplicatesAndSort(allMovies, 'classics');
    renderMovieSlider(sliderId, uniqueMovies.slice(0, 10), title);

  } catch (error) {
    console.error('Error loading classics:', error);
    document.getElementById(sliderId).innerHTML = `<div class="slider-error">Failed to load acclaimed classics</div>`;
  }
}

// Fetch movies with specific parameters
async function fetchMoviesWithParams(params) {
  try {
    // Build query string from parameters
    const queryString = new URLSearchParams(params).toString();
    const url = `http://localhost:8080/api/movies/search?${queryString}`;
    
    // Log the API call for debugging
    console.log(`Fetching movies with URL: ${url}`);
    console.log(`Parameters:`, params);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const movies = await response.json();
    console.log(`Received ${movies.length} movies for params:`, params);
    
    return Array.isArray(movies) ? movies : [];
    
  } catch (error) {
    console.error('Error fetching movies with params:', params, error);
    return [];
  }
}

// Remove duplicates and sort movies based on category
function removeDuplicatesAndSort(movies, category) {
  // Remove duplicates based on imdbID
  const uniqueMovies = movies.filter((movie, index, self) => 
    index === self.findIndex(m => m.imdbID === movie.imdbID)
  );

  // Sort based on category
  switch (category) {
    case 'recent':
      // Sort by year (newest first)
      return uniqueMovies.sort((a, b) => {
        const yearA = parseInt(a.Year) || 0;
        const yearB = parseInt(b.Year) || 0;
        return yearB - yearA;
      });
      
    case 'trending':
      // Prioritize movies with posters
      return uniqueMovies.sort((a, b) => {
        const aPoster = a.Poster && a.Poster !== 'N/A' ? 1 : 0;
        const bPoster = b.Poster && b.Poster !== 'N/A' ? 1 : 0;
        return bPoster - aPoster;
      });
      
    case 'classics':
      // Sort by year (older first for classics)
      return uniqueMovies.sort((a, b) => {
        const yearA = parseInt(a.Year) || 0;
        const yearB = parseInt(b.Year) || 0;
        return yearA - yearB;
      });
      
    default:
      return uniqueMovies;
  }
}

// Render a movie slider with movies
function renderMovieSlider(sliderId, movies, title) {
  const slider = document.getElementById(sliderId);
  
  if (movies.length === 0) {
    slider.innerHTML = `<div class="slider-error">No movies found for ${title.toLowerCase()}</div>`;
    return;
  }

  slider.innerHTML = `
    <div class="slider-container">
      <button class="slider-btn slider-btn-prev" data-slider="${sliderId}" data-direction="-1">‹</button>
      <div class="slider-track" id="${sliderId}-track">
        ${movies.map((movie, index) => `
          <div class="slider-movie-card" data-movie-id="${movie.imdbID}" data-movie-title="${movie.Title.replace(/"/g, '&quot;')}">
            ${movie.Poster && movie.Poster !== 'N/A' ? 
              `<img src="${movie.Poster}" alt="${movie.Title}" class="slider-movie-poster">` : 
              `<div class="slider-no-poster">No Image</div>`
            }
            <div class="slider-movie-info">
              <h4>${movie.Title}</h4>
              <p>${movie.Year}</p>
            </div>
          </div>
        `).join('')}
      </div>
      <button class="slider-btn slider-btn-next" data-slider="${sliderId}" data-direction="1">›</button>
    </div>
  `;

  // Add event listeners for slider buttons
  const prevBtn = slider.querySelector('.slider-btn-prev');
  const nextBtn = slider.querySelector('.slider-btn-next');
  
  prevBtn.addEventListener('click', () => slideMovies(sliderId, -1));
  nextBtn.addEventListener('click', () => slideMovies(sliderId, 1));

  // Add event listeners for movie cards
  const movieCards = slider.querySelectorAll('.slider-movie-card');
  movieCards.forEach(card => {
    card.addEventListener('click', () => {
      const movieId = card.dataset.movieId;
      const movieTitle = card.dataset.movieTitle;
      viewMovieDetails(movieId, movieTitle);
    });
  });

  // Initialize button states
  setTimeout(() => {
    const track = document.getElementById(`${sliderId}-track`);
    if (track) {
      const container = track.parentElement;
      const cards = track.querySelectorAll('.slider-movie-card');
      const cardWidth = cards[0]?.offsetWidth || 200;
      const gap = 16;
      const cardStep = cardWidth + gap;
      const containerWidth = container.offsetWidth - 80;
      const minScroll = Math.min(0, containerWidth - (cards.length * cardStep));
      updateSliderButtons(sliderId, 0, minScroll, 0);
    }
  }, 100);
}

// Slide movies in slider
function slideMovies(sliderId, direction) {
  const track = document.getElementById(`${sliderId}-track`);
  if (!track) return;
  
  const cards = track.querySelectorAll('.slider-movie-card');
  if (cards.length === 0) return;
  
  const container = track.parentElement;
  const cardWidth = cards[0].offsetWidth;
  const gap = 16; // 1rem gap from CSS
  const cardStep = cardWidth + gap;
  
  // Calculate how many cards are visible
  const containerWidth = container.offsetWidth - 80; // Account for buttons
  const visibleCards = Math.floor(containerWidth / cardStep);
  const scrollStep = Math.max(1, Math.floor(visibleCards * 0.8)); // Scroll 80% of visible cards
  
  // Get current position
  let currentTransform = getComputedStyle(track).transform;
  let currentX = 0;
  
  if (currentTransform && currentTransform !== 'none') {
    const matrix = currentTransform.match(/matrix.*\((.+)\)/);
    if (matrix) {
      const values = matrix[1].split(', ');
      currentX = parseFloat(values[4]) || 0;
    }
  }
  
  // Calculate new position
  const newX = currentX + (direction * scrollStep * cardStep);
  
  // Calculate boundaries
  const maxScroll = 0;
  const minScroll = Math.min(0, containerWidth - (cards.length * cardStep));
  
  // Apply boundaries
  const finalX = Math.max(minScroll, Math.min(maxScroll, newX));
  
  // Apply transform with smooth transition
  track.style.transition = 'transform 0.3s ease';
  track.style.transform = `translateX(${finalX}px)`;
  
  // Update button states
  updateSliderButtons(sliderId, finalX, minScroll, maxScroll);
}

// Update slider button states
function updateSliderButtons(sliderId, currentX, minScroll, maxScroll) {
  const slider = document.getElementById(sliderId);
  if (!slider) return;
  
  const prevBtn = slider.querySelector('.slider-btn-prev');
  const nextBtn = slider.querySelector('.slider-btn-next');
  
  // Disable/enable buttons based on position
  if (prevBtn) {
    prevBtn.disabled = currentX >= maxScroll;
    prevBtn.style.opacity = currentX >= maxScroll ? '0.5' : '1';
  }
  
  if (nextBtn) {
    nextBtn.disabled = currentX <= minScroll;
    nextBtn.style.opacity = currentX <= minScroll ? '0.5' : '1';
  }
}

// Handle search input with debouncing
let searchTimeout;
function handleSearchMovies(event) {
  const searchTerm = event.target.value.trim();
  
  // Clear previous timeout
  clearTimeout(searchTimeout);
  
  // If search term is empty, return to home page
  if (searchTerm === '') {
    renderHomePage();
    return;
  }
  
  // Don't search if less than 3 characters
  if (searchTerm.length < 3) {
    return;
  }
  
  // Debounce search to avoid too many API calls
  searchTimeout = setTimeout(() => {
    searchMovies(searchTerm);
  }, 300);
}

// Fetch movies from backend API
async function searchMovies(searchTerm) {
  try {
    // Update URL for search
    updateURL(`?search=${encodeURIComponent(searchTerm)}`, { 
      type: 'search', 
      term: searchTerm 
    });

    // Use the new parameter format that matches your backend
    const searchParams = {
      s: searchTerm,  // OMDb API expects 's' parameter for search
      type: 'movie'   // Only search for movies
    };
    
    const queryString = new URLSearchParams(searchParams).toString();
    const response = await fetch(`http://localhost:8080/api/movies/search?${queryString}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const movies = await response.json();
    
    // Store search state
    lastSearchTerm = searchTerm;
    lastSearchResults = movies;
    
    renderSearchResults(movies, searchTerm);
    
  } catch (error) {
    console.error('Error fetching movies:', error);
    renderSearchError(searchTerm);
  }
}

// Advanced search function with multiple parameters
async function advancedSearchMovies(searchParams) {
  try {
    const queryString = new URLSearchParams(searchParams).toString();
    const response = await fetch(`http://localhost:8080/api/movies/search?${queryString}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error in advanced search:', error);
    return [];
  }
}

// Display search results
function renderSearchResults(movies, searchTerm) {
  content.innerHTML = `
    <div class="header search-results">
      <h1>Search Results</h1>
      <p>Found ${movies.length} movie(s) for "${searchTerm}"</p>
    </div>

    <div class="search-container results">
      <input type="text" placeholder="Search for a movie..." class="search-bar" 
             id="searchMoviesField" value="${searchTerm}">
    </div>

    <div class="movies-container">
      ${movies.length > 0 ? 
        movies.map(movie => `
          <div class="movie-card" onclick="viewMovieDetails('${movie.imdbID}', '${movie.Title.replace(/'/g, "\\'")}')">
            <h3>${movie.Title}</h3>
            <p><strong>Year:</strong> ${movie.Year}</p>
            <p><strong>Type:</strong> ${movie.Type}</p>
            <p><strong>IMDB ID:</strong> ${movie.imdbID}</p>
            ${movie.Poster && movie.Poster !== 'N/A' ? `<img src="${movie.Poster}" alt="${movie.Title}" class="movie-poster">` : ''}
            <div class="click-hint">Click to view details</div>
          </div>
        `).join('') 
        : 
        '<p class="no-results">No movies found matching your search.</p>'
      }
    </div>

    <div>
      <button class="button" id="backToHomeBtn">Back to Home</button>
    </div>
  `;

  // Re-attach event listeners
  const searchField = document.getElementById('searchMoviesField');
  searchField.addEventListener("input", handleSearchMovies);
  
  const backBtn = document.getElementById('backToHomeBtn');
  backBtn.addEventListener("click", () => {
    updateURL('', { type: 'home' });
    renderHomePage();
  });
}

// Display search error message
function renderSearchError(searchTerm) {
  content.innerHTML = `
    <div class="header search-results">
      <h1>Search Error</h1>
      <p>Couldn't find a movie named "${searchTerm}"</p>
    </div>

    <div class="search-container results">
      <input type="text" placeholder="Search for a movie..." class="search-bar" 
             id="searchMoviesField" value="${searchTerm}">
    </div>

    <div class="movies-container">
      <div class="error-message">
        <h3>❌ Search Failed</h3>
        <p>We couldn't find any movies matching "${searchTerm}". This might be due to:</p>
        <ul>
          <li>Network connection issues</li>
          <li>Server is temporarily unavailable</li>
          <li>No movies found with that title</li>
        </ul>
        <p>Please try again with a different search term or check your connection.</p>
      </div>
    </div>

    <div>
      <button class="button" id="backToHomeBtn">Back to Home</button>
    </div>
  `;

  // Re-attach event listeners
  const searchField = document.getElementById('searchMoviesField');
  searchField.addEventListener("input", handleSearchMovies);
  
  const backBtn = document.getElementById('backToHomeBtn');
  backBtn.addEventListener("click", () => {
    updateURL('', { type: 'home' });
    renderHomePage();
  });
}

// View movie details
async function viewMovieDetails(imdbId, movieTitle) {
  try {
    // Update URL for movie details
    updateURL(`?movie=${encodeURIComponent(imdbId)}&title=${encodeURIComponent(movieTitle)}`, { 
      type: 'movie', 
      movieId: imdbId, 
      title: movieTitle 
    });

    // Show loading state
    content.innerHTML = `
      <div class="header search-results">
        <h1>Loading...</h1>
        <p>Fetching details for "${movieTitle}"</p>
      </div>
    `;

    // Fetch movie details from backend API
    const response = await fetch(`http://localhost:8080/api/movies/${encodeURIComponent(imdbId)}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const movieDetails = await response.json();
    renderMovieDetails(movieDetails);
    
  } catch (error) {
    console.error('Error fetching movie details:', error);
    renderMovieDetailsError(movieTitle);
  }
}

// Display movie details
function renderMovieDetails(movie) {
  content.innerHTML = `
    <div class="movie-details-container">
      <div class="movie-details-header">
        <div class="movie-poster-large">
          ${movie.Poster && movie.Poster !== 'N/A' ? 
            `<img src="${movie.Poster}" alt="${movie.Title}" class="details-poster">` : 
            '<div class="no-poster">No Poster Available</div>'
          }
        </div>
        <div class="movie-info">
          <h1>${movie.Title}</h1>
          <div class="movie-meta">
            <span class="rating">⭐ ${movie.imdbRating}/10</span>
            <span class="year">${movie.Year}</span>
            <span class="rated">${movie.Rated}</span>
            <span class="runtime">${movie.Runtime}</span>
          </div>
          <p class="genre"><strong>Genre:</strong> ${movie.Genre}</p>
          <p class="director"><strong>Director:</strong> ${movie.Director}</p>
          <p class="actors"><strong>Actors:</strong> ${movie.Actors}</p>
          <p class="language"><strong>Language:</strong> ${movie.Language}</p>
        </div>
      </div>
      
      <div class="movie-plot">
        <h3>Plot</h3>
        <p>${movie.Plot}</p>
      </div>

      <div class="movie-actions">
        <button class="button" id="backToSearchBtn">Back to Search</button>
        <button class="button" id="bookFilmBtn">Book Film</button>
        <button class="button" id="backToHomeBtn">Back to Home</button>
      </div>
    </div>
  `;

  // Add event listeners
  const backToSearchBtn = document.getElementById('backToSearchBtn');
  if (backToSearchBtn) {
    backToSearchBtn.addEventListener("click", () => {
      // Go back to last search results if available
      if (lastSearchTerm && lastSearchResults.length > 0) {
        updateURL(`?search=${encodeURIComponent(lastSearchTerm)}`, { 
          type: 'search', 
          term: lastSearchTerm 
        });
        renderSearchResults(lastSearchResults, lastSearchTerm);
      } else {
        updateURL('', { type: 'home' });
        renderHomePage();
      }
    });
  }
  
  const backToHomeBtn = document.getElementById('backToHomeBtn');
  backToHomeBtn.addEventListener("click", () => {
    updateURL('', { type: 'home' });
    renderHomePage();
  });

  // Add event listener for Book Film button
  const bookFilmBtn = document.getElementById('bookFilmBtn');
  if (bookFilmBtn) {
    bookFilmBtn.addEventListener("click", () => {
      bookMovie(movie);
    });
  }
}

// Book a movie
function bookMovie(movie) {
  // Generate a unique booking ID
  const bookingId = Date.now() + Math.random().toString(36).substr(2, 9);
  
  // Create booking object
  const booking = {
    id: bookingId,
    movieTitle: movie.Title,
    movieYear: movie.Year,
    moviePoster: movie.Poster,
    imdbId: movie.imdbID,
    bookingDate: new Date().toISOString(),
    customerName: prompt("Enter your name for the booking:") || "Anonymous"
  };

  // Get existing bookings from localStorage
  let bookings = JSON.parse(localStorage.getItem('movieBookings')) || [];
  
  // Add new booking
  bookings.push(booking);
  
  // Save to localStorage
  localStorage.setItem('movieBookings', JSON.stringify(bookings));
  
  // Show confirmation
  alert(`Successfully booked "${movie.Title}"! Booking ID: ${bookingId}`);
  
  // Optionally send to backend (if available)
  try {
    fetch('http://localhost:8080/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(booking)
    }).catch(error => {
      console.log('Backend not available, booking saved locally only');
    });
  } catch (error) {
    console.log('Backend not available, booking saved locally only');
  }
}

// Display error when movie details can't be loaded
function renderMovieDetailsError(movieTitle) {
  content.innerHTML = `
    <div class="header search-results">
      <h1>Error Loading Movie</h1>
      <p>Couldn't load details for "${movieTitle}"</p>
    </div>

    <div class="movies-container">
      <div class="error-message">
        <h3>❌ Failed to Load Movie Details</h3>
        <p>We couldn't load the details for "${movieTitle}". This might be due to:</p>
        <ul>
          <li>Network connection issues</li>
          <li>Server is temporarily unavailable</li>
          <li>Movie details not found</li>
        </ul>
        <p>Please try again later or go back to search for other movies.</p>
      </div>
    </div>

    <div>
      <button class="button" id="backToSearchBtn">Back to Search</button>
      <button class="button" id="backToHomeBtn">Back to Home</button>
    </div>
  `;

  // Add event listeners
  const backToSearchBtn = document.getElementById('backToSearchBtn');
  if (backToSearchBtn) {
    backToSearchBtn.addEventListener("click", () => {
      // Go back to last search results if available
      if (lastSearchTerm && lastSearchResults.length > 0) {
        updateURL(`?search=${encodeURIComponent(lastSearchTerm)}`, { 
          type: 'search', 
          term: lastSearchTerm 
        });
        renderSearchResults(lastSearchResults, lastSearchTerm);
      } else {
        updateURL('', { type: 'home' });
        renderHomePage();
      }
    });
  }
  
  const backToHomeBtn = document.getElementById('backToHomeBtn');
  backToHomeBtn.addEventListener("click", () => {
    updateURL('', { type: 'home' });
    renderHomePage();
  });
}// ===== AUTHENTICATION SYSTEM =====

// Setup bookings button
function setupAuthButtons() {
  // Remove any existing auth containers first
  const existingContainer = document.querySelector('.auth-buttons-container');
  if (existingContainer) {
    existingContainer.remove();
  }
  
  // Create container for bookings button
  const authContainer = document.createElement('div');
  authContainer.className = 'auth-buttons-container';
  
  // Create show bookings button
  const showBookingsBtn = document.createElement('button');
  showBookingsBtn.className = 'auth-button auth-button-bookings';
  showBookingsBtn.textContent = 'Show Bookings';
  showBookingsBtn.addEventListener('click', () => {
    showBookings();
  });
  
  authContainer.appendChild(showBookingsBtn);
  
  // Append container to body
  document.body.appendChild(authContainer);
}

// Show bookings page
function showBookings() {
  // Get bookings from localStorage
  const bookings = JSON.parse(localStorage.getItem('movieBookings')) || [];
  
  content.innerHTML = `
    <div class="bookings-header">
      <h1>Your Movie Bookings</h1>
      <p>View all your booked movies</p>
    </div>
    
    <div class="bookings-container">
      ${bookings.length === 0 ? 
        `<div class="no-bookings">
          <h3>No bookings yet</h3>
          <p>You haven't booked any movies yet. Browse our movies and start booking!</p>
          <button class="button" onclick="loadHomePage()">Browse Movies</button>
        </div>` :
        bookings.map(booking => `
          <div class="booking-card">
            <div class="booking-poster">
              ${booking.moviePoster && booking.moviePoster !== 'N/A' ? 
                `<img src="${booking.moviePoster}" alt="${booking.movieTitle}">` : 
                '<div class="no-poster">No Poster</div>'
              }
            </div>
            <div class="booking-details">
              <h3>${booking.movieTitle} (${booking.movieYear})</h3>
              <p><strong>Booking ID:</strong> ${booking.id}</p>
              <p><strong>Customer:</strong> ${booking.customerName}</p>
              <p><strong>Booked on:</strong> ${new Date(booking.bookingDate).toLocaleDateString()}</p>
              <button class="button small" onclick="cancelBooking('${booking.id}')">Cancel Booking</button>
            </div>
          </div>
        `).join('')
      }
    </div>
    
    <div class="bookings-actions">
      <button class="button" onclick="loadHomePage()">Back to Home</button>
    </div>
  `;
}

// Cancel a booking
function cancelBooking(bookingId) {
  if (confirm('Are you sure you want to cancel this booking?')) {
    // Get existing bookings
    let bookings = JSON.parse(localStorage.getItem('movieBookings')) || [];
    
    // Remove the booking with the specified ID
    bookings = bookings.filter(booking => booking.id !== bookingId);
    
    // Save updated bookings
    localStorage.setItem('movieBookings', JSON.stringify(bookings));
    
    // Refresh the bookings view
    showBookings();
    
    alert('Booking cancelled successfully!');
  }
}

// Load home page (wrapper for renderHomePage)
function loadHomePage() {
  updateURL('', { type: 'home' });
  renderHomePage();
}

// Show Sign Up Form
function showSignUpForm() {
  const modal = document.createElement('div');
  modal.className = 'auth-modal';
  modal.id = 'signUpModal';
  
  modal.innerHTML = `
    <div class="auth-modal-content">
      <button class="auth-modal-close" onclick="closeAuthModal('signUpModal')">&times;</button>
      <h2>Create Account</h2>
      <p class="auth-subtitle">Join KinoXP Cinema</p>
      
      <form class="auth-form" id="signUpForm">
        <div class="form-group">
          <label for="signupEmail">Email</label>
          <input type="email" id="signupEmail" name="email" placeholder="Enter your email" required>
        </div>
        
        <div class="form-group">
          <label for="signupUsername">Username</label>
          <input type="text" id="signupUsername" name="username" placeholder="Choose a username" required>
        </div>
        
        <div class="form-group">
          <label for="signupPassword">Password</label>
          <input type="password" id="signupPassword" name="password" placeholder="Create a password" required minlength="6">
        </div>
        
        <div class="form-group">
          <label for="signupRole">Role</label>
          <select id="signupRole" name="role" required>
            <option value="USER">Customer</option>
            <option value="EMPLOYEE">Employee</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
        
        <button type="submit" class="auth-submit-btn">Create Account</button>
      </form>
      
      <p class="auth-switch">
        Already have an account? 
        <a href="#" onclick="switchToSignIn(event)">Sign In</a>
      </p>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Add form submit handler
  const form = document.getElementById('signUpForm');
  form.addEventListener('submit', handleSignUp);
  
  // Close modal when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeAuthModal('signUpModal');
    }
  });
}

// Show Sign In Form
function showSignInForm() {
  console.log('Showing sign in form');
  
  const modal = document.createElement('div');
  modal.className = 'auth-modal';
  modal.id = 'signInModal';
  
  modal.innerHTML = `
    <div class="auth-modal-content">
      <button class="auth-modal-close" onclick="closeAuthModal('signInModal')">&times;</button>
      <h2>Welcome Back</h2>
      <p class="auth-subtitle">Sign in to your account</p>
      
      <form class="auth-form" id="signInForm">
        <div class="form-group">
          <label for="signinEmail">Email</label>
          <input type="email" id="signinEmail" name="email" placeholder="Enter your email" required>
        </div>
        
        <div class="form-group">
          <label for="signinPassword">Password</label>
          <input type="password" id="signinPassword" name="password" placeholder="Enter your password" required>
        </div>
        
        <button type="submit" class="auth-submit-btn">Sign In</button>
      </form>
      
      <p class="auth-switch">
        Don't have an account? 
        <a href="#" onclick="switchToSignUp(event)">Sign Up</a>
      </p>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Add form submit handler
  const form = document.getElementById('signInForm');
  form.addEventListener('submit', handleSignIn);
  
  // Close modal when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeAuthModal('signInModal');
    }
  });
}

// Handle Sign Up form submission
function handleSignUp(event) {
  event.preventDefault();
  
  const email = document.getElementById('signupEmail').value;
  const username = document.getElementById('signupUsername').value;
  const password = document.getElementById('signupPassword').value;
  const role = document.getElementById('signupRole').value;
  
  console.log('Sign Up Data:', { email, username, password, role });
  
  // Disable submit button to prevent double submission
  const submitBtn = event.target.querySelector('.auth-submit-btn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Creating Account...';
  
  // Call backend register API
  fetch('http://localhost:8080/api/users/register', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ 
      email: email, 
      username: username, 
      password: password,
      role: role
    })
  })  
  .then(response => {
    console.log('Register response status:', response.status);
    
    if (!response.ok) {
      if (response.status === 409) {
        throw new Error('User with this email already exists');
      } else if (response.status === 400) {
        throw new Error('Invalid input data');
      } else {
        return response.text().then(errorMsg => {
          throw new Error(`Registration failed: ${errorMsg}`);
        });
      }
    }
    
    // Check if response is JSON or plain text
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    } else {
      // Handle plain text response
      return response.text().then(text => {
        return {
          email: email,
          username: username,
          role: role,
          message: text
        };
      });
    }
  })
  .then(data => {
    console.log('Sign up successful:', data);
    closeAuthModal('signUpModal');
    alert(`Account created successfully!\nWelcome, ${username}!\nRole: ${role}`);
    
    // Automatically sign in the user
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userEmail', email);
    localStorage.setItem('username', username);
    localStorage.setItem('userRole', role);
    
    // Update auth buttons
    setupAuthButtons();
  })
  .catch(error => {
    console.error('Sign up error:', error);
    alert(`Registration failed: ${error.message}`);
    // Re-enable button
    submitBtn.disabled = false;
    submitBtn.textContent = 'Create Account';
  });
}

// Handle Sign In form submission
function handleSignIn(event) {
  console.log('Sign in form submitted');
  event.preventDefault();
  
  const email = document.getElementById('signinEmail').value;
  const password = document.getElementById('signinPassword').value;
  
  console.log('Sign In Data:', { email, password });
  
  // Disable submit button to prevent double submission
  const submitBtn = event.target.querySelector('.auth-submit-btn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Signing In...';
  
  // Call backend login API
  fetch('http://localhost:8080/api/users/login', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ 
      email: email,
      password: password 
    })
  })
  .then(response => {
    console.log('Login response status:', response.status);
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid email or password');
      } else if (response.status === 404) {
        throw new Error('User not found');
      } else {
        return response.text().then(errorMsg => {
          throw new Error(`Login failed: ${errorMsg}`);
        });
      }
    }
    
    // Always try to handle as text first since backend returns "Login successful"
    return response.text().then(text => {
      console.log('Login response text:', text);
      
      // Check if the response looks like JSON
      if (text.startsWith('{') || text.startsWith('[')) {
        try {
          return JSON.parse(text);
        } catch (e) {
          console.log('Failed to parse as JSON, treating as plain text');
        }
      }
      
      // Handle plain text response like "Login successful"
      console.log('Handling plain text response:', text);
      
      // Since backend returns plain text for successful login,
      // we'll create a user object and try to get more details later
      const basicUser = {
        email: email,
        username: email.split('@')[0],
        role: 'USER', // Default role, will be updated if we can fetch real data
        message: text
      };
      
      // Try to get actual user data using search endpoint
      return fetch(`http://localhost:8080/api/users/search?username=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      })
      .then(searchResponse => {
        if (searchResponse.ok) {
          return searchResponse.json().then(users => {
            if (users && users.length > 0) {
              const user = users[0];
              return {
                email: user.email || email,
                username: user.username || email.split('@')[0],
                role: user.role || 'USER',
                id: user.id || user.userId || user.userID,
                message: text
              };
            }
            return basicUser;
          }).catch(() => basicUser);
        }
        return basicUser;
      })
      .catch(() => {
        console.log('Search failed, using basic user data');
        return basicUser;
      });
    });
  })
  .then(userData => {
    console.log('Sign in successful:', userData);
    closeAuthModal('signInModal');
    
    // Store user session
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userEmail', userData.email);
    localStorage.setItem('username', userData.username);
    localStorage.setItem('userRole', userData.role);
    
    // Store the complete user object for easier access
    localStorage.setItem('currentUser', JSON.stringify(userData));
    
    alert(`Welcome back, ${userData.username}!\nRole: ${userData.role}`);
    
    // Update auth buttons to show user is logged in
    setupAuthButtons();
  })
  .catch(error => {
    console.error('Sign in error:', error);
    alert(`Sign in failed: ${error.message}`);
    // Re-enable button
    submitBtn.disabled = false;
    submitBtn.textContent = 'Sign In';
  });
}

// Handle logout
function handleLogout() {
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userRole');
  localStorage.removeItem('username');
  localStorage.removeItem('currentUser');
  
  // Remove current auth buttons and recreate them
  setupAuthButtons();
  alert('You have been logged out successfully!');
}

// Show user menu based on role
function showUserMenu() {
  const userRole = localStorage.getItem('userRole') || 'USER';
  const username = localStorage.getItem('username') || 'User';
  
  // Create modal overlay
  const modal = document.createElement('div');
  modal.className = 'auth-modal';
  modal.id = 'userMenuModal';
  
  // Generate menu content based on role
  let menuContent = '';
  
  if (userRole === 'ADMIN') {
    // Admin: User and Employee management ONLY
    menuContent = `
      <div class="role-section">
        <h4>👥 User Management</h4>
        <button class="user-menu-btn" onclick="viewAllUsers()">
          <span class="menu-icon">👥</span>
          View All Users
        </button>
        <button class="user-menu-btn" onclick="showUserSearchForm()">
          <span class="menu-icon">🔍</span>
          Search Users
        </button>
        <button class="user-menu-btn" onclick="showUserManagement()">
          <span class="menu-icon">⚙️</span>
          Manage Users
        </button>
      </div>
      
      <div class="role-section">
        <h4>👨‍💼 Employee Management</h4>
        <button class="user-menu-btn" onclick="viewAllEmployees()">
          <span class="menu-icon">👨‍💼</span>
          View All Employees
        </button>
        <button class="user-menu-btn" onclick="showEmployeeManagement()">
          <span class="menu-icon">⚙️</span>
          Manage Employees
        </button>
      </div>
    `;
  } else if (userRole === 'EMPLOYEE') {
    // Employee: Show and Theater management ONLY
    menuContent = `
      <div class="role-section">
        <h4>🎬 Show Management</h4>
        <button class="user-menu-btn" onclick="viewAllShows()">
          <span class="menu-icon">🎬</span>
          View All Shows
        </button>
        <button class="user-menu-btn" onclick="showCreateShowForm()">
          <span class="menu-icon">➕</span>
          Create Show
        </button>
        <button class="user-menu-btn" onclick="showEditShowForm()">
          <span class="menu-icon">✏️</span>
          Edit Shows
        </button>
      </div>
      
      <div class="role-section">
        <h4>🏛️ Theater Management</h4>
        <button class="user-menu-btn" onclick="viewAllTheaters()">
          <span class="menu-icon">🏛️</span>
          View All Theaters
        </button>
        <button class="user-menu-btn" onclick="showCreateTheaterForm()">
          <span class="menu-icon">🏗️</span>
          Create Theater
        </button>
        <button class="user-menu-btn" onclick="showEditTheaterForm()">
          <span class="menu-icon">✏️</span>
          Edit Theaters
        </button>
      </div>
    `;
  } else {
    // USER/GUEST: Booking management ONLY
    menuContent = `
      <div class="role-section">
        <h4>🎫 My Bookings</h4>
        <button class="user-menu-btn" onclick="showMyBookings()">
          <span class="menu-icon">📋</span>
          View My Bookings
        </button>
        <button class="user-menu-btn" onclick="showCreateBookingForm()">
          <span class="menu-icon">➕</span>
          Create New Booking
        </button>
        <button class="user-menu-btn" onclick="showEditBookingForm()">
          <span class="menu-icon">✏️</span>
          Edit My Bookings
        </button>
        <button class="user-menu-btn" onclick="showCancelBookingForm()">
          <span class="menu-icon">❌</span>
          Cancel Bookings
        </button>
      </div>
      
      <div class="role-section">
        <h4>🎭 Available Shows</h4>
        <button class="user-menu-btn" onclick="viewAvailableShows()">
          <span class="menu-icon">🎭</span>
          Browse Shows
        </button>
      </div>
    `;
  }
  
  modal.innerHTML = `
    <div class="auth-modal-content user-menu-content">
      <button class="auth-modal-close" onclick="closeAuthModal('userMenuModal')">&times;</button>
      <h2>Dashboard</h2>
      <p class="auth-subtitle">Welcome, ${username} <span class="user-role ${userRole.toLowerCase()}">${userRole}</span></p>
      
      <div class="user-menu-actions">
        ${menuContent}
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Close modal when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeAuthModal('userMenuModal');
    }
  });
}

// Close authentication modal
function closeAuthModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.remove();
  }
}

// Switch between forms
function switchToSignIn(event) {
  event.preventDefault();
  closeAuthModal('signUpModal');
  showSignInForm();
}

function switchToSignUp(event) {
  event.preventDefault();
  closeAuthModal('signInModal');
  showSignUpForm();
}

// ===== ROLE-BASED FUNCTIONALITY =====

// Check user permission for access control
function checkPermission(requiredRoles) {
  const userRole = localStorage.getItem('userRole');
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  
  if (!isLoggedIn) {
    alert('Please log in to access this feature');
    return false;
  }
  
  // Convert single role to array for consistent checking
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  
  if (!roles.includes(userRole)) {
    alert(`Access denied. This feature requires ${roles.join(' or ')} role. Your current role: ${userRole}`);
    return false;
  }
  
  return true;
}

// ===== ADMIN FUNCTIONS =====
function viewAllUsers() {
  if (!checkPermission('ADMIN')) return;
  closeAuthModal('userMenuModal');
  
  // Render users management page
  content.innerHTML = `
    <div class="management-page">
      <div class="header">
        <h1>👥 User Management</h1>
        <p>Manage all cinema users and customers</p>
      </div>
      
      <div class="management-actions">
        <button class="button" onclick="loadAllUsers()">Refresh Users</button>
        <button class="button" onclick="showUserSearchForm()">Search Users</button>
        <button class="button" onclick="renderHomePage()">Back to Home</button>
      </div>
      
      <div id="usersContainer" class="users-grid">
        <div class="loading-message">Loading users...</div>
      </div>
    </div>
  `;
  
  loadAllUsers();
}

function showUserSearchForm() {
  if (!checkPermission('ADMIN')) return;
  closeAuthModal('userMenuModal');
  
  // Create search user form modal
  const modal = document.createElement('div');
  modal.className = 'auth-modal';
  modal.id = 'searchUserModal';
  
  modal.innerHTML = `
    <div class="auth-modal-content">
      <button class="auth-modal-close" onclick="closeAuthModal('searchUserModal')">&times;</button>
      <h2>Search Users</h2>
      <p class="auth-subtitle">Find users by username or email</p>
      
      <form class="auth-form" id="searchUserForm">
        <div class="form-group">
          <label for="searchQuery">Search Term</label>
          <input type="text" id="searchQuery" name="query" placeholder="Enter username or email" required>
        </div>
        
        <button type="submit" class="auth-submit-btn">Search Users</button>
        <button type="button" class="button" onclick="closeAuthModal('searchUserModal')" style="margin-top: 0.5rem;">Cancel</button>
      </form>
      
      <div id="searchResults" class="search-results-container" style="margin-top: 1rem;"></div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Add form submit handler
  const form = document.getElementById('searchUserForm');
  form.addEventListener('submit', handleUserSearch);
  
  // Close modal when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeAuthModal('searchUserModal');
    }
  });
}

function handleUserSearch(event) {
  event.preventDefault();
  
  const query = document.getElementById('searchQuery').value.trim();
  const submitBtn = event.target.querySelector('.auth-submit-btn');
  const resultsContainer = document.getElementById('searchResults');
  
  if (!query) {
    alert('Please enter a search term');
    return;
  }
  
  submitBtn.disabled = true;
  submitBtn.textContent = 'Searching...';
  resultsContainer.innerHTML = '<div class="loading-message">Searching users...</div>';
  
  // Call backend search API
  fetch(`http://localhost:8080/api/users/search?username=${encodeURIComponent(query)}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(users => {
    console.log('Search results:', users);
    displaySearchResults(users, query);
    // Re-enable button
    submitBtn.disabled = false;
    submitBtn.textContent = 'Search Users';
  })
  .catch(error => {
    console.error('Search error:', error);
    resultsContainer.innerHTML = `
      <div class="error-message">
        <h4>❌ Search Failed</h4>
        <p>Could not search users: ${error.message}</p>
      </div>
    `;
    // Re-enable button
    submitBtn.disabled = false;
    submitBtn.textContent = 'Search Users';
  });
}

function displaySearchResults(users, query) {
  const resultsContainer = document.getElementById('searchResults');
  
  if (users.length === 0) {
    resultsContainer.innerHTML = `
      <div class="info-message">
        <h4>🔍 No Results</h4>
        <p>No users found matching "${query}"</p>
      </div>
    `;
    return;
  }
  
  const resultsHtml = users.map((user, index) => {
    const userId = user.id || user.userId || user.userID || user.email || index;
    
    return `
      <div class="user-card" style="margin-bottom: 1rem;">
        <div class="user-card-header">
          <h4>${user.username || 'Unknown User'}</h4>
          <span class="user-role ${(user.role || 'USER').toLowerCase()}">${user.role || 'USER'}</span>
        </div>
        <div class="user-card-body">
          <p class="user-email">${user.email || 'No email'}</p>
          <div class="user-card-actions">
            <button class="button small" onclick="editUser('${userId}', '${user.username || user.email}')">Edit</button>
            <button class="button small danger" onclick="deleteUser('${userId}', '${user.username || user.email}')">Delete</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
  
  resultsContainer.innerHTML = `
    <h4>Search Results (${users.length} found)</h4>
    ${resultsHtml}
  `;
}

function showUserManagement() {
  if (!checkPermission('ADMIN')) return;
  closeAuthModal('userMenuModal');
  alert('Admin: User management dashboard - edit/delete users functionality');
}

function viewAllEmployees() {
  if (!checkPermission('ADMIN')) return;
  closeAuthModal('userMenuModal');
  
  // Create view all employees modal
  const modal = document.createElement('div');
  modal.className = 'auth-modal';
  modal.id = 'viewEmployeesModal';
  
  modal.innerHTML = `
    <div class="auth-modal-content">
      <button class="auth-modal-close" onclick="closeAuthModal('viewEmployeesModal')">&times;</button>
      <h2>All Employees</h2>
      <p class="auth-subtitle">View and manage all employee accounts</p>
      
      <div id="employeesListContainer">
        <div class="loading-message">Loading employees...</div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Load employees
  loadEmployeesList();
  
  // Close modal when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeAuthModal('viewEmployeesModal');
    }
  });
}

function loadEmployeesList() {
  const container = document.getElementById('employeesListContainer');
  
  fetch('http://localhost:8080/api/users', {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(users => {
    const employees = users.filter(user => user.role === 'EMPLOYEE');
    displayAllEmployees(employees);
  })
  .catch(error => {
    console.error('Fetch employees error:', error);
    container.innerHTML = `
      <div class="error-message">
        <h4>❌ Failed to Load Employees</h4>
        <p>${error.message}</p>
        <button class="button" onclick="loadEmployeesList()">Retry</button>
      </div>
    `;
  });
}

function displayAllEmployees(employees) {
  const container = document.getElementById('employeesListContainer');
  
  if (employees.length === 0) {
    container.innerHTML = `
      <div class="info-message">
        <h4>👥 No Employees Found</h4>
        <p>There are currently no employees in the system.</p>
        <button class="button" onclick="showEmployeeManagement(); closeAuthModal('viewEmployeesModal')">Create Employee</button>
      </div>
    `;
    return;
  }
  
  const employeesHtml = employees.map((employee, index) => {
    const employeeId = employee.id || employee.userId || employee.userID || employee.email || index;
    
    return `
      <div class="user-card" style="margin-bottom: 1rem;">
        <div class="user-card-header">
          <h4>${employee.username || 'Unknown Employee'}</h4>
          <span class="user-role employee">EMPLOYEE</span>
        </div>
        <div class="user-card-body">
          <p class="user-email">${employee.email || 'No email'}</p>
          <div class="user-card-actions">
            <button class="button small" onclick="editUser('${employeeId}', '${employee.username || employee.email}')">Edit</button>
            <button class="button small danger" onclick="deleteUser('${employeeId}', '${employee.username || employee.email}')">Delete</button>
            <button class="button small" onclick="demoteEmployeeFromList('${employeeId}', '${employee.username || employee.email}')">Demote to User</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
  
  container.innerHTML = `
    <div class="employees-header" style="margin-bottom: 1rem;">
      <h3>All Employees (${employees.length})</h3>
      <button class="button" onclick="showEmployeeManagement(); closeAuthModal('viewEmployeesModal')">Manage Employees</button>
    </div>
    ${employeesHtml}
  `;
}

function demoteEmployeeFromList(employeeId, employeeName) {
  if (!confirm(`Are you sure you want to demote ${employeeName} to a regular user?`)) {
    return;
  }
  
  // First get the employee data
  fetch(`http://localhost:8080/api/users/${employeeId}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`Failed to get employee data: ${response.status}`);
    }
    return response.json();
  })
  .then(employee => {
    // Update role to USER
    return fetch(`http://localhost:8080/api/users/${employeeId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...employee,
        role: 'USER'
      })
    });
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`Failed to demote employee: ${response.status}`);
    }
    return response.text();
  })
  .then(result => {
    alert(`${employeeName} demoted to User successfully!`);
    // Refresh the employee list
    loadEmployeesList();
  })
  .catch(error => {
    console.error('Demote employee error:', error);
    alert(`Failed to demote employee: ${error.message}`);
  });
}

function showEmployeeManagement() {
  if (!checkPermission('ADMIN')) return;
  closeAuthModal('userMenuModal');
  
  // Create employee management modal
  const modal = document.createElement('div');
  modal.className = 'auth-modal';
  modal.id = 'employeeManagementModal';
  
  modal.innerHTML = `
    <div class="auth-modal-content">
      <button class="auth-modal-close" onclick="closeAuthModal('employeeManagementModal')">&times;</button>
      <h2>Employee Management</h2>
      <p class="auth-subtitle">Manage employee accounts and permissions</p>
      
      <div class="management-actions">
        <button class="button" onclick="showCreateEmployeeForm()">Create New Employee</button>
        <button class="button" onclick="viewAllEmployeesInModal()">View All Employees</button>
        <button class="button" onclick="showPromoteUserForm()">Promote User to Employee</button>
      </div>
      
      <div id="employeeManagementContent" style="margin-top: 1rem;"></div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Close modal when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeAuthModal('employeeManagementModal');
    }
  });
}

function showCreateEmployeeForm() {
  const contentDiv = document.getElementById('employeeManagementContent');
  
  contentDiv.innerHTML = `
    <h3>Create New Employee</h3>
    <form class="auth-form" id="createEmployeeForm">
      <div class="form-group">
        <label for="empUsername">Username</label>
        <input type="text" id="empUsername" name="username" required>
      </div>
      
      <div class="form-group">
        <label for="empEmail">Email</label>
        <input type="email" id="empEmail" name="email" required>
      </div>
      
      <div class="form-group">
        <label for="empPassword">Password</label>
        <input type="password" id="empPassword" name="password" required>
      </div>
      
      <button type="submit" class="auth-submit-btn">Create Employee</button>
      <button type="button" class="button" onclick="document.getElementById('employeeManagementContent').innerHTML = ''">Cancel</button>
    </form>
  `;
  
  document.getElementById('createEmployeeForm').addEventListener('submit', handleCreateEmployee);
}

function handleCreateEmployee(event) {
  event.preventDefault();
  
  const formData = new FormData(event.target);
  const employeeData = {
    username: formData.get('username'),
    email: formData.get('email'),
    password: formData.get('password'),
    role: 'EMPLOYEE'
  };
  
  const submitBtn = event.target.querySelector('.auth-submit-btn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Creating...';
  
  fetch('http://localhost:8080/api/users/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(employeeData)
  })
  .then(response => {
    if (!response.ok) {
      return response.text().then(text => {
        throw new Error(`Failed to create employee: ${text}`);
      });
    }
    return response.text();
  })
  .then(result => {
    alert('Employee created successfully!');
    document.getElementById('employeeManagementContent').innerHTML = '';
    submitBtn.disabled = false;
    submitBtn.textContent = 'Create Employee';
  })
  .catch(error => {
    console.error('Create employee error:', error);
    alert(`Failed to create employee: ${error.message}`);
    submitBtn.disabled = false;
    submitBtn.textContent = 'Create Employee';
  });
}

function viewAllEmployeesInModal() {
  const contentDiv = document.getElementById('employeeManagementContent');
  contentDiv.innerHTML = '<div class="loading-message">Loading employees...</div>';
  
  fetch('http://localhost:8080/api/users', {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(users => {
    const employees = users.filter(user => user.role === 'EMPLOYEE');
    displayEmployeesInModal(employees);
  })
  .catch(error => {
    console.error('Fetch employees error:', error);
    contentDiv.innerHTML = `
      <div class="error-message">
        <h4>❌ Failed to Load Employees</h4>
        <p>${error.message}</p>
      </div>
    `;
  });
}

function displayEmployeesInModal(employees) {
  const contentDiv = document.getElementById('employeeManagementContent');
  
  if (employees.length === 0) {
    contentDiv.innerHTML = `
      <div class="info-message">
        <h4>👥 No Employees Found</h4>
        <p>There are currently no employees in the system.</p>
      </div>
    `;
    return;
  }
  
  const employeesHtml = employees.map((employee, index) => {
    const employeeId = employee.id || employee.userId || employee.userID || employee.email || index;
    
    return `
      <div class="user-card" style="margin-bottom: 1rem;">
        <div class="user-card-header">
          <h4>${employee.username || 'Unknown Employee'}</h4>
          <span class="user-role employee">EMPLOYEE</span>
        </div>
        <div class="user-card-body">
          <p class="user-email">${employee.email || 'No email'}</p>
          <div class="user-card-actions">
            <button class="button small" onclick="editUser('${employeeId}', '${employee.username || employee.email}')">Edit</button>
            <button class="button small danger" onclick="deleteUser('${employeeId}', '${employee.username || employee.email}')">Delete</button>
            <button class="button small" onclick="demoteEmployee('${employeeId}', '${employee.username || employee.email}')">Demote to User</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
  
  contentDiv.innerHTML = `
    <h3>All Employees (${employees.length})</h3>
    ${employeesHtml}
  `;
}

function showPromoteUserForm() {
  const contentDiv = document.getElementById('employeeManagementContent');
  
  contentDiv.innerHTML = `
    <h3>Promote User to Employee</h3>
    <form class="auth-form" id="promoteUserForm">
      <div class="form-group">
        <label for="promoteUsername">Username or Email</label>
        <input type="text" id="promoteUsername" name="username" placeholder="Enter username or email" required>
      </div>
      
      <button type="submit" class="auth-submit-btn">Promote to Employee</button>
      <button type="button" class="button" onclick="document.getElementById('employeeManagementContent').innerHTML = ''">Cancel</button>
    </form>
  `;
  
  document.getElementById('promoteUserForm').addEventListener('submit', handlePromoteUser);
}

function handlePromoteUser(event) {
  event.preventDefault();
  
  const username = document.getElementById('promoteUsername').value.trim();
  const submitBtn = event.target.querySelector('.auth-submit-btn');
  
  if (!username) {
    alert('Please enter a username or email');
    return;
  }
  
  submitBtn.disabled = true;
  submitBtn.textContent = 'Promoting...';
  
  // First, search for the user
  fetch(`http://localhost:8080/api/users/search?username=${encodeURIComponent(username)}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`Failed to find user: ${response.status}`);
    }
    return response.json();
  })
  .then(users => {
    if (users.length === 0) {
      throw new Error('User not found');
    }
    
    const user = users[0];
    const userId = user.id || user.userId || user.userID;
    
    if (user.role === 'EMPLOYEE') {
      throw new Error('User is already an employee');
    }
    
    // Update user role to EMPLOYEE
    return fetch(`http://localhost:8080/api/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...user,
        role: 'EMPLOYEE'
      })
    });
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`Failed to promote user: ${response.status}`);
    }
    return response.text();
  })
  .then(result => {
    alert(`User ${username} promoted to Employee successfully!`);
    document.getElementById('employeeManagementContent').innerHTML = '';
    submitBtn.disabled = false;
    submitBtn.textContent = 'Promote to Employee';
  })
  .catch(error => {
    console.error('Promote user error:', error);
    alert(`Failed to promote user: ${error.message}`);
    submitBtn.disabled = false;
    submitBtn.textContent = 'Promote to Employee';
  });
}

function demoteEmployee(employeeId, employeeName) {
  if (!confirm(`Are you sure you want to demote ${employeeName} to a regular user?`)) {
    return;
  }
  
  // First get the employee data
  fetch(`http://localhost:8080/api/users/${employeeId}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`Failed to get employee data: ${response.status}`);
    }
    return response.json();
  })
  .then(employee => {
    // Update role to USER
    return fetch(`http://localhost:8080/api/users/${employeeId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...employee,
        role: 'USER'
      })
    });
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`Failed to demote employee: ${response.status}`);
    }
    return response.text();
  })
  .then(result => {
    alert(`${employeeName} demoted to User successfully!`);
    // Refresh the employee list
    viewAllEmployeesInModal();
  })
  .catch(error => {
    console.error('Demote employee error:', error);
    alert(`Failed to demote employee: ${error.message}`);
  });
}

function loadAllUsers() {
  // This will integrate with your UserController GET /api/users endpoint
  fetch('http://localhost:8080/api/users', {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(users => {
    displayUsers(users);
  })
  .catch(error => {
    console.error('Error loading users:', error);
    document.getElementById('usersContainer').innerHTML = `
      <div class="error-message">
        <h3>❌ Error Loading Users</h3>
        <p>Could not load users: ${error.message}</p>
      </div>
    `;
  });
}

function displayUsers(users) {
  const container = document.getElementById('usersContainer');
  
  if (users.length === 0) {
    container.innerHTML = `
      <div class="info-message">
        <h3>📝 No Users Found</h3>
        <p>No users are registered in the system yet.</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = users.map((user, index) => {
    // Try to get the user ID from different possible field names
    const userId = user.id || user.userId || user.userID || user.email || index;
    
    return `
      <div class="user-card">
        <div class="user-card-header">
          <h3>${user.username || 'Unknown User'}</h3>
          <span class="user-role ${(user.role || 'USER').toLowerCase()}">${user.role || 'USER'}</span>
        </div>
        <div class="user-card-body">
          <p class="user-email">${user.email || 'No email'}</p>
          <div class="user-card-actions">
            <button class="button small" onclick="editUser('${userId}', '${user.username || user.email}')">Edit</button>
            <button class="button small danger" onclick="deleteUser('${userId}', '${user.username || user.email}')">Delete</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function editUser(userId, username) {
  if (!userId || userId === 'undefined') {
    alert('Cannot edit user: Invalid user ID');
    return;
  }
  
  // Create edit user form modal
  const modal = document.createElement('div');
  modal.className = 'auth-modal';
  modal.id = 'editUserModal';
  
  modal.innerHTML = `
    <div class="auth-modal-content">
      <button class="auth-modal-close" onclick="closeAuthModal('editUserModal')">&times;</button>
      <h2>Edit User</h2>
      <p class="auth-subtitle">Editing user: ${username}</p>
      
      <form class="auth-form" id="editUserForm">
        <div class="form-group">
          <label for="editUsername">Username</label>
          <input type="text" id="editUsername" name="username" placeholder="Enter username" required>
        </div>
        
        <div class="form-group">
          <label for="editEmail">Email</label>
          <input type="email" id="editEmail" name="email" placeholder="Enter email" required>
        </div>
        
        <div class="form-group">
          <label for="editRole">Role</label>
          <select id="editRole" name="role" required>
            <option value="USER">Customer</option>
            <option value="EMPLOYEE">Employee</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
        
        <button type="submit" class="auth-submit-btn">Update User</button>
        <button type="button" class="button" onclick="closeAuthModal('editUserModal')" style="margin-top: 0.5rem;">Cancel</button>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Add form submit handler
  const form = document.getElementById('editUserForm');
  form.addEventListener('submit', (event) => handleEditUser(event, userId));
  
  // Close modal when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeAuthModal('editUserModal');
    }
  });
}

function handleEditUser(event, userId) {
  event.preventDefault();
  
  const username = document.getElementById('editUsername').value;
  const email = document.getElementById('editEmail').value;
  const role = document.getElementById('editRole').value;
  
  const submitBtn = event.target.querySelector('.auth-submit-btn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Updating...';
  
  // Call backend edit API
  fetch(`http://localhost:8080/api/users/${userId}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ 
      username: username,
      email: email,
      role: role
    })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    console.log('User updated successfully:', data);
    closeAuthModal('editUserModal');
    alert(`User "${username}" updated successfully!`);
    // Refresh the users list
    loadAllUsers();
  })
  .catch(error => {
    console.error('Edit user error:', error);
    alert(`Failed to update user: ${error.message}`);
    // Re-enable button
    submitBtn.disabled = false;
    submitBtn.textContent = 'Update User';
  });
}

function deleteUser(userId, username) {
  if (!userId || userId === 'undefined') {
    alert('Cannot delete user: Invalid user ID');
    return;
  }
  
  if (confirm(`Are you sure you want to delete user "${username}"?\n\nThis action cannot be undone.`)) {
    // Call backend delete API
    fetch(`http://localhost:8080/api/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json'
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.text(); // DELETE might return plain text
    })
    .then(message => {
      console.log('User deleted successfully:', message);
      alert(`User "${username}" deleted successfully!`);
      // Refresh the users list
      loadAllUsers();
    })
    .catch(error => {
      console.error('Delete user error:', error);
      alert(`Failed to delete user: ${error.message}`);
    });
  }
}

// ===== EMPLOYEE FUNCTIONS =====
function viewAllShows() {
  if (!checkPermission('EMPLOYEE')) return;
  closeAuthModal('userMenuModal');
  
  content.innerHTML = `
    <div class="management-page">
      <div class="header">
        <h1>🎬 Show Management</h1>
        <p>Manage cinema shows and schedules</p>
      </div>
      
      <div class="management-actions">
        <button class="button" onclick="loadAllShows()">Refresh Shows</button>
        <button class="button" onclick="showCreateShowForm()">Create New Show</button>
        <button class="button" onclick="renderHomePage()">Back to Home</button>
      </div>
      
      <div id="showsContainer" class="shows-grid">
        <div class="loading-message">Loading shows...</div>
      </div>
    </div>
  `;
  
  loadAllShows();
}

function loadAllShows() {
  const container = document.getElementById('showsContainer');
  container.innerHTML = '<div class="loading-message">Loading shows...</div>';
  
  fetch('http://localhost:8080/api/shows', {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(shows => {
    displayAllShows(shows);
  })
  .catch(error => {
    console.error('Fetch shows error:', error);
    container.innerHTML = `
      <div class="error-message">
        <h4>❌ Failed to Load Shows</h4>
        <p>${error.message}</p>
        <button class="button" onclick="loadAllShows()">Retry</button>
      </div>
    `;
  });
}

function displayAllShows(shows) {
  const container = document.getElementById('showsContainer');
  
  if (shows.length === 0) {
    container.innerHTML = `
      <div class="info-message">
        <h4>🎬 No Shows Found</h4>
        <p>There are currently no shows scheduled.</p>
        <button class="button" onclick="showCreateShowForm()">Create First Show</button>
      </div>
    `;
    return;
  }
  
  const showsHtml = shows.map((show, index) => {
    const showId = show.id || show.showId || show.showID || index;
    
    return `
      <div class="show-card" style="margin-bottom: 1rem; padding: 1rem; background: var(--surface-color); border-radius: 0.5rem;">
        <div class="show-card-header">
          <h4>${show.title || show.movieTitle || 'Unknown Movie'}</h4>
          <span class="show-time">${show.showTime || show.time || 'No time set'}</span>
        </div>
        <div class="show-card-body">
          <p><strong>Theater:</strong> ${show.theaterName || show.theater || 'Unknown Theater'}</p>
          <p><strong>Date:</strong> ${show.showDate || show.date || 'No date set'}</p>
          <p><strong>Price:</strong> ${show.price ? '$' + show.price : 'No price set'}</p>
          <div class="show-card-actions">
            <button class="button small" onclick="editShow('${showId}')">Edit</button>
            <button class="button small danger" onclick="deleteShow('${showId}', '${show.title || 'this show'}')">Delete</button>
            <button class="button small" onclick="viewShowDetails('${showId}')">View Details</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
  
  container.innerHTML = `
    <h3>All Shows (${shows.length})</h3>
    <div class="shows-grid">${showsHtml}</div>
  `;
}

function showCreateShowForm() {
  if (!checkPermission('EMPLOYEE')) return;
  
  // Create show form modal
  const modal = document.createElement('div');
  modal.className = 'auth-modal';
  modal.id = 'createShowModal';
  
  modal.innerHTML = `
    <div class="auth-modal-content">
      <button class="auth-modal-close" onclick="closeAuthModal('createShowModal')">&times;</button>
      <h2>Create New Show</h2>
      <p class="auth-subtitle">Add a new movie show to the schedule</p>
      
      <form class="auth-form" id="createShowForm">
        <div class="form-group">
          <label for="showTitle">Movie Title</label>
          <input type="text" id="showTitle" name="title" required>
        </div>
        
        <div class="form-group">
          <label for="showDate">Show Date</label>
          <input type="date" id="showDate" name="date" required>
        </div>
        
        <div class="form-group">
          <label for="showTime">Show Time</label>
          <input type="time" id="showTime" name="time" required>
        </div>
        
        <div class="form-group">
          <label for="showTheater">Theater</label>
          <select id="showTheater" name="theater" required>
            <option value="">Select Theater</option>
            <option value="1">Theater 1 - Small (240 seats)</option>
            <option value="2">Theater 2 - Large (400 seats)</option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="showPrice">Ticket Price ($)</label>
          <input type="number" id="showPrice" name="price" step="0.01" min="0" required>
        </div>
        
        <div class="form-group">
          <label for="showDescription">Description (Optional)</label>
          <textarea id="showDescription" name="description" rows="3"></textarea>
        </div>
        
        <button type="submit" class="auth-submit-btn">Create Show</button>
        <button type="button" class="button" onclick="closeAuthModal('createShowModal')" style="margin-top: 0.5rem;">Cancel</button>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Add form submit handler
  const form = document.getElementById('createShowForm');
  form.addEventListener('submit', handleCreateShow);
  
  // Close modal when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeAuthModal('createShowModal');
    }
  });
}

function handleCreateShow(event) {
  event.preventDefault();
  
  const formData = new FormData(event.target);
  const showData = {
    title: formData.get('title'),
    showDate: formData.get('date'),
    showTime: formData.get('time'),
    theaterId: formData.get('theater'),
    price: parseFloat(formData.get('price')),
    description: formData.get('description') || ''
  };
  
  const submitBtn = event.target.querySelector('.auth-submit-btn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Creating...';
  
  fetch('http://localhost:8080/api/shows', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(showData)
  })
  .then(response => {
    if (!response.ok) {
      return response.text().then(text => {
        throw new Error(`Failed to create show: ${text}`);
      });
    }
    return response.text();
  })
  .then(result => {
    alert('Show created successfully!');
    closeAuthModal('createShowModal');
    // Refresh shows if on the shows page
    if (document.getElementById('showsContainer')) {
      loadAllShows();
    }
    submitBtn.disabled = false;
    submitBtn.textContent = 'Create Show';
  })
  .catch(error => {
    console.error('Create show error:', error);
    alert(`Failed to create show: ${error.message}`);
    submitBtn.disabled = false;
    submitBtn.textContent = 'Create Show';
  });
}

function editShow(showId) {
  // First get the show data
  fetch(`http://localhost:8080/api/shows/${showId}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`Failed to get show data: ${response.status}`);
    }
    return response.json();
  })
  .then(show => {
    showEditShowForm(show);
  })
  .catch(error => {
    console.error('Get show error:', error);
    alert(`Failed to load show data: ${error.message}`);
  });
}

function showEditShowForm(show) {
  const showId = show.id || show.showId || show.showID;
  
  // Create edit show form modal
  const modal = document.createElement('div');
  modal.className = 'auth-modal';
  modal.id = 'editShowModal';
  
  modal.innerHTML = `
    <div class="auth-modal-content">
      <button class="auth-modal-close" onclick="closeAuthModal('editShowModal')">&times;</button>
      <h2>Edit Show</h2>
      <p class="auth-subtitle">Update movie show details</p>
      
      <form class="auth-form" id="editShowForm">
        <input type="hidden" id="editShowId" value="${showId}">
        
        <div class="form-group">
          <label for="editShowTitle">Movie Title</label>
          <input type="text" id="editShowTitle" name="title" value="${show.title || show.movieTitle || ''}" required>
        </div>
        
        <div class="form-group">
          <label for="editShowDate">Show Date</label>
          <input type="date" id="editShowDate" name="date" value="${show.showDate || show.date || ''}" required>
        </div>
        
        <div class="form-group">
          <label for="editShowTime">Show Time</label>
          <input type="time" id="editShowTime" name="time" value="${show.showTime || show.time || ''}" required>
        </div>
        
        <div class="form-group">
          <label for="editShowTheater">Theater</label>
          <select id="editShowTheater" name="theater" required>
            <option value="">Select Theater</option>
            <option value="1" ${(show.theaterId || show.theater) == '1' ? 'selected' : ''}>Theater 1 - Small (240 seats)</option>
            <option value="2" ${(show.theaterId || show.theater) == '2' ? 'selected' : ''}>Theater 2 - Large (400 seats)</option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="editShowPrice">Ticket Price ($)</label>
          <input type="number" id="editShowPrice" name="price" step="0.01" min="0" value="${show.price || ''}" required>
        </div>
        
        <div class="form-group">
          <label for="editShowDescription">Description (Optional)</label>
          <textarea id="editShowDescription" name="description" rows="3">${show.description || ''}</textarea>
        </div>
        
        <button type="submit" class="auth-submit-btn">Update Show</button>
        <button type="button" class="button" onclick="closeAuthModal('editShowModal')" style="margin-top: 0.5rem;">Cancel</button>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Add form submit handler
  const form = document.getElementById('editShowForm');
  form.addEventListener('submit', handleEditShow);
  
  // Close modal when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeAuthModal('editShowModal');
    }
  });
}

function handleEditShow(event) {
  event.preventDefault();
  
  const showId = document.getElementById('editShowId').value;
  const formData = new FormData(event.target);
  const showData = {
    title: formData.get('title'),
    showDate: formData.get('date'),
    showTime: formData.get('time'),
    theaterId: formData.get('theater'),
    price: parseFloat(formData.get('price')),
    description: formData.get('description') || ''
  };
  
  const submitBtn = event.target.querySelector('.auth-submit-btn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Updating...';
  
  fetch(`http://localhost:8080/api/shows/${showId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(showData)
  })
  .then(response => {
    if (!response.ok) {
      return response.text().then(text => {
        throw new Error(`Failed to update show: ${text}`);
      });
    }
    return response.text();
  })
  .then(result => {
    alert('Show updated successfully!');
    closeAuthModal('editShowModal');
    // Refresh shows if on the shows page
    if (document.getElementById('showsContainer')) {
      loadAllShows();
    }
    submitBtn.disabled = false;
    submitBtn.textContent = 'Update Show';
  })
  .catch(error => {
    console.error('Update show error:', error);
    alert(`Failed to update show: ${error.message}`);
    submitBtn.disabled = false;
    submitBtn.textContent = 'Update Show';
  });
}

function deleteShow(showId, showTitle) {
  if (!confirm(`Are you sure you want to delete "${showTitle}"?`)) {
    return;
  }
  
  fetch(`http://localhost:8080/api/shows/${showId}`, {
    method: 'DELETE'
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`Failed to delete show: ${response.status}`);
    }
    return response.text();
  })
  .then(result => {
    alert(`Show "${showTitle}" deleted successfully!`);
    // Refresh shows if on the shows page
    if (document.getElementById('showsContainer')) {
      loadAllShows();
    }
  })
  .catch(error => {
    console.error('Delete show error:', error);
    alert(`Failed to delete show: ${error.message}`);
  });
}

function viewShowDetails(showId) {
  // Get show details and display in a modal
  fetch(`http://localhost:8080/api/shows/${showId}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`Failed to get show details: ${response.status}`);
    }
    return response.json();
  })
  .then(show => {
    displayShowDetailsModal(show);
  })
  .catch(error => {
    console.error('Get show details error:', error);
    alert(`Failed to load show details: ${error.message}`);
  });
}

function displayShowDetailsModal(show) {
  const modal = document.createElement('div');
  modal.className = 'auth-modal';
  modal.id = 'showDetailsModal';
  
  modal.innerHTML = `
    <div class="auth-modal-content">
      <button class="auth-modal-close" onclick="closeAuthModal('showDetailsModal')">&times;</button>
      <h2>Show Details</h2>
      
      <div class="show-details">
        <h3>${show.title || show.movieTitle || 'Unknown Movie'}</h3>
        <div class="detail-row">
          <strong>Date:</strong> ${show.showDate || show.date || 'No date set'}
        </div>
        <div class="detail-row">
          <strong>Time:</strong> ${show.showTime || show.time || 'No time set'}
        </div>
        <div class="detail-row">
          <strong>Theater:</strong> ${show.theaterName || show.theater || 'Unknown Theater'}
        </div>
        <div class="detail-row">
          <strong>Price:</strong> ${show.price ? '$' + show.price : 'No price set'}
        </div>
        ${show.description ? `<div class="detail-row"><strong>Description:</strong> ${show.description}</div>` : ''}
      </div>
      
      <div class="modal-actions" style="margin-top: 1rem;">
        <button class="button" onclick="editShow('${show.id || show.showId || show.showID}')">Edit Show</button>
        <button class="button" onclick="closeAuthModal('showDetailsModal')">Close</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Close modal when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeAuthModal('showDetailsModal');
    }
  });
}

function viewAllTheaters() {
  if (!checkPermission('EMPLOYEE')) return;
  closeAuthModal('userMenuModal');
  
  content.innerHTML = `
    <div class="management-page">
      <div class="header">
        <h1>🏛️ Theater Management</h1>
        <p>Manage cinema theaters and seating</p>
      </div>
      
      <div class="management-actions">
        <button class="button" onclick="loadAllTheaters()">Refresh Theaters</button>
        <button class="button" onclick="showCreateTheaterForm()">Add New Theater</button>
        <button class="button" onclick="renderHomePage()">Back to Home</button>
      </div>
      
      <div id="theatersContainer">
        <div class="loading-message">Loading theaters...</div>
      </div>
    </div>
  `;
  
  loadAllTheaters();
}

function loadAllTheaters() {
  const container = document.getElementById('theatersContainer');
  container.innerHTML = '<div class="loading-message">Loading theaters...</div>';
  
  fetch('http://localhost:8080/api/theaters', {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(theaters => {
    displayAllTheaters(theaters);
  })
  .catch(error => {
    console.error('Fetch theaters error:', error);
    // Show default theaters if API is not available
    displayDefaultTheaters();
  });
}

function displayAllTheaters(theaters) {
  const container = document.getElementById('theatersContainer');
  
  if (theaters.length === 0) {
    container.innerHTML = `
      <div class="info-message">
        <h4>🏛️ No Theaters Found</h4>
        <p>There are currently no theaters configured.</p>
        <button class="button" onclick="showCreateTheaterForm()">Create First Theater</button>
      </div>
    `;
    return;
  }
  
  const theatersHtml = theaters.map((theater, index) => {
    const theaterId = theater.id || theater.theaterId || theater.theaterID || index + 1;
    const totalSeats = (theater.rows || 20) * (theater.seatsPerRow || 12);
    
    return `
      <div class="theater-card" style="margin-bottom: 1rem; padding: 1rem; background: var(--surface-color); border-radius: 0.5rem;">
        <h3>${theater.name || `Theater ${theaterId}`}</h3>
        <p>${theater.rows || 20} rows × ${theater.seatsPerRow || 12} seats = ${totalSeats} total seats</p>
        <p><strong>Type:</strong> ${theater.type || (totalSeats > 300 ? 'Large' : 'Small')}</p>
        <div class="theater-actions">
          <button class="button small" onclick="editTheater('${theaterId}')">Edit</button>
          <button class="button small" onclick="viewTheaterSeating('${theaterId}')">View Seating</button>
          <button class="button small danger" onclick="deleteTheater('${theaterId}', '${theater.name || `Theater ${theaterId}`}')">Delete</button>
        </div>
      </div>
    `;
  }).join('');
  
  container.innerHTML = `
    <h3>All Theaters (${theaters.length})</h3>
    <div class="theaters-grid">${theatersHtml}</div>
  `;
}

function displayDefaultTheaters() {
  const container = document.getElementById('theatersContainer');
  
  container.innerHTML = `
    <h3>Theater Configuration</h3>
    <div class="theater-info">
      <div class="theater-card">
        <h3>Theater 1 - Small</h3>
        <p>20 rows × 12 seats = 240 total seats</p>
        <div class="theater-actions">
          <button class="button small" onclick="editTheater(1)">Edit</button>
          <button class="button small" onclick="viewTheaterSeating(1)">View Seating</button>
        </div>
      </div>
      
      <div class="theater-card">
        <h3>Theater 2 - Large</h3>
        <p>25 rows × 16 seats = 400 total seats</p>
        <div class="theater-actions">
          <button class="button small" onclick="editTheater(2)">Edit</button>
          <button class="button small" onclick="viewTheaterSeating(2)">View Seating</button>
        </div>
      </div>
    </div>
  `;
}

function showCreateTheaterForm() {
  if (!checkPermission('EMPLOYEE')) return;
  
  // Create theater form modal
  const modal = document.createElement('div');
  modal.className = 'auth-modal';
  modal.id = 'createTheaterModal';
  
  modal.innerHTML = `
    <div class="auth-modal-content">
      <button class="auth-modal-close" onclick="closeAuthModal('createTheaterModal')">&times;</button>
      <h2>Create New Theater</h2>
      <p class="auth-subtitle">Add a new theater to the cinema</p>
      
      <form class="auth-form" id="createTheaterForm">
        <div class="form-group">
          <label for="theaterName">Theater Name</label>
          <input type="text" id="theaterName" name="name" placeholder="e.g., Theater 3" required>
        </div>
        
        <div class="form-group">
          <label for="theaterType">Theater Type</label>
          <select id="theaterType" name="type" required>
            <option value="">Select Type</option>
            <option value="Small">Small (Up to 300 seats)</option>
            <option value="Large">Large (Over 300 seats)</option>
            <option value="Premium">Premium</option>
            <option value="IMAX">IMAX</option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="theaterRows">Number of Rows</label>
          <input type="number" id="theaterRows" name="rows" min="5" max="50" value="20" required>
        </div>
        
        <div class="form-group">
          <label for="theaterSeatsPerRow">Seats per Row</label>
          <input type="number" id="theaterSeatsPerRow" name="seatsPerRow" min="5" max="30" value="12" required>
        </div>
        
        <div class="form-group">
          <label for="theaterDescription">Description (Optional)</label>
          <textarea id="theaterDescription" name="description" rows="3" placeholder="Special features, accessibility options, etc."></textarea>
        </div>
        
        <div class="theater-preview" style="margin: 1rem 0; padding: 1rem; background: var(--accent-color-10); border-radius: 0.5rem;">
          <h4>Preview:</h4>
          <p id="totalSeatsPreview">Total Seats: 240</p>
        </div>
        
        <button type="submit" class="auth-submit-btn">Create Theater</button>
        <button type="button" class="button" onclick="closeAuthModal('createTheaterModal')" style="margin-top: 0.5rem;">Cancel</button>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Add preview calculation
  const rowsInput = document.getElementById('theaterRows');
  const seatsInput = document.getElementById('theaterSeatsPerRow');
  const preview = document.getElementById('totalSeatsPreview');
  
  function updatePreview() {
    const rows = parseInt(rowsInput.value) || 0;
    const seats = parseInt(seatsInput.value) || 0;
    const total = rows * seats;
    preview.textContent = `Total Seats: ${total}`;
  }
  
  rowsInput.addEventListener('input', updatePreview);
  seatsInput.addEventListener('input', updatePreview);
  
  // Add form submit handler
  const form = document.getElementById('createTheaterForm');
  form.addEventListener('submit', handleCreateTheater);
  
  // Close modal when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeAuthModal('createTheaterModal');
    }
  });
}

function handleCreateTheater(event) {
  event.preventDefault();
  
  const formData = new FormData(event.target);
  const theaterData = {
    name: formData.get('name'),
    type: formData.get('type'),
    rows: parseInt(formData.get('rows')),
    seatsPerRow: parseInt(formData.get('seatsPerRow')),
    description: formData.get('description') || ''
  };
  
  const submitBtn = event.target.querySelector('.auth-submit-btn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Creating...';
  
  fetch('http://localhost:8080/api/theaters', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(theaterData)
  })
  .then(response => {
    if (!response.ok) {
      return response.text().then(text => {
        throw new Error(`Failed to create theater: ${text}`);
      });
    }
    return response.text();
  })
  .then(result => {
    alert('Theater created successfully!');
    closeAuthModal('createTheaterModal');
    // Refresh theaters if on the theaters page
    if (document.getElementById('theatersContainer')) {
      loadAllTheaters();
    }
    submitBtn.disabled = false;
    submitBtn.textContent = 'Create Theater';
  })
  .catch(error => {
    console.error('Create theater error:', error);
    alert(`Failed to create theater: ${error.message}`);
    submitBtn.disabled = false;
    submitBtn.textContent = 'Create Theater';
  });
}

function editTheater(theaterId) {
  // First try to get theater data from API
  fetch(`http://localhost:8080/api/theaters/${theaterId}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  })
  .then(response => {
    if (!response.ok) {
      // If API not available, show default theater data
      throw new Error(`Theater API not available`);
    }
    return response.json();
  })
  .then(theater => {
    showEditTheaterForm(theater);
  })
  .catch(error => {
    console.error('Get theater error:', error);
    // Show edit form with default theater data
    const defaultTheater = {
      id: theaterId,
      name: `Theater ${theaterId}`,
      type: theaterId == 1 ? 'Small' : 'Large',
      rows: theaterId == 1 ? 20 : 25,
      seatsPerRow: theaterId == 1 ? 12 : 16,
      description: ''
    };
    showEditTheaterForm(defaultTheater);
  });
}

function showEditTheaterForm(theater) {
  const theaterId = theater.id || theater.theaterId || theater.theaterID;
  
  // Create edit theater form modal
  const modal = document.createElement('div');
  modal.className = 'auth-modal';
  modal.id = 'editTheaterModal';
  
  modal.innerHTML = `
    <div class="auth-modal-content">
      <button class="auth-modal-close" onclick="closeAuthModal('editTheaterModal')">&times;</button>
      <h2>Edit Theater</h2>
      <p class="auth-subtitle">Update theater details</p>
      
      <form class="auth-form" id="editTheaterForm">
        <input type="hidden" id="editTheaterId" value="${theaterId}">
        
        <div class="form-group">
          <label for="editTheaterName">Theater Name</label>
          <input type="text" id="editTheaterName" name="name" value="${theater.name || ''}" required>
        </div>
        
        <div class="form-group">
          <label for="editTheaterType">Theater Type</label>
          <select id="editTheaterType" name="type" required>
            <option value="">Select Type</option>
            <option value="Small" ${theater.type === 'Small' ? 'selected' : ''}>Small (Up to 300 seats)</option>
            <option value="Large" ${theater.type === 'Large' ? 'selected' : ''}>Large (Over 300 seats)</option>
            <option value="Premium" ${theater.type === 'Premium' ? 'selected' : ''}>Premium</option>
            <option value="IMAX" ${theater.type === 'IMAX' ? 'selected' : ''}>IMAX</option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="editTheaterRows">Number of Rows</label>
          <input type="number" id="editTheaterRows" name="rows" min="5" max="50" value="${theater.rows || 20}" required>
        </div>
        
        <div class="form-group">
          <label for="editTheaterSeatsPerRow">Seats per Row</label>
          <input type="number" id="editTheaterSeatsPerRow" name="seatsPerRow" min="5" max="30" value="${theater.seatsPerRow || 12}" required>
        </div>
        
        <div class="form-group">
          <label for="editTheaterDescription">Description (Optional)</label>
          <textarea id="editTheaterDescription" name="description" rows="3">${theater.description || ''}</textarea>
        </div>
        
        <div class="theater-preview" style="margin: 1rem 0; padding: 1rem; background: var(--accent-color-10); border-radius: 0.5rem;">
          <h4>Preview:</h4>
          <p id="editTotalSeatsPreview">Total Seats: ${(theater.rows || 20) * (theater.seatsPerRow || 12)}</p>
        </div>
        
        <button type="submit" class="auth-submit-btn">Update Theater</button>
        <button type="button" class="button" onclick="closeAuthModal('editTheaterModal')" style="margin-top: 0.5rem;">Cancel</button>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Add preview calculation
  const rowsInput = document.getElementById('editTheaterRows');
  const seatsInput = document.getElementById('editTheaterSeatsPerRow');
  const preview = document.getElementById('editTotalSeatsPreview');
  
  function updatePreview() {
    const rows = parseInt(rowsInput.value) || 0;
    const seats = parseInt(seatsInput.value) || 0;
    const total = rows * seats;
    preview.textContent = `Total Seats: ${total}`;
  }
  
  rowsInput.addEventListener('input', updatePreview);
  seatsInput.addEventListener('input', updatePreview);
  
  // Add form submit handler
  const form = document.getElementById('editTheaterForm');
  form.addEventListener('submit', handleEditTheater);
  
  // Close modal when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeAuthModal('editTheaterModal');
    }
  });
}

function handleEditTheater(event) {
  event.preventDefault();
  
  const theaterId = document.getElementById('editTheaterId').value;
  const formData = new FormData(event.target);
  const theaterData = {
    name: formData.get('name'),
    type: formData.get('type'),
    rows: parseInt(formData.get('rows')),
    seatsPerRow: parseInt(formData.get('seatsPerRow')),
    description: formData.get('description') || ''
  };
  
  const submitBtn = event.target.querySelector('.auth-submit-btn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Updating...';
  
  fetch(`http://localhost:8080/api/theaters/${theaterId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(theaterData)
  })
  .then(response => {
    if (!response.ok) {
      return response.text().then(text => {
        throw new Error(`Failed to update theater: ${text}`);
      });
    }
    return response.text();
  })
  .then(result => {
    alert('Theater updated successfully!');
    closeAuthModal('editTheaterModal');
    // Refresh theaters if on the theaters page
    if (document.getElementById('theatersContainer')) {
      loadAllTheaters();
    }
    submitBtn.disabled = false;
    submitBtn.textContent = 'Update Theater';
  })
  .catch(error => {
    console.error('Update theater error:', error);
    alert(`Failed to update theater: ${error.message}`);
    submitBtn.disabled = false;
    submitBtn.textContent = 'Update Theater';
  });
}

function deleteTheater(theaterId, theaterName) {
  if (!confirm(`Are you sure you want to delete "${theaterName}"? This will also cancel all shows in this theater.`)) {
    return;
  }
  
  fetch(`http://localhost:8080/api/theaters/${theaterId}`, {
    method: 'DELETE'
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`Failed to delete theater: ${response.status}`);
    }
    return response.text();
  })
  .then(result => {
    alert(`Theater "${theaterName}" deleted successfully!`);
    // Refresh theaters if on the theaters page
    if (document.getElementById('theatersContainer')) {
      loadAllTheaters();
    }
  })
  .catch(error => {
    console.error('Delete theater error:', error);
    alert(`Failed to delete theater: ${error.message}`);
  });
}

function viewTheaterSeating(theaterId) {
  // Get theater data and show seating layout
  fetch(`http://localhost:8080/api/theaters/${theaterId}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  })
  .then(response => {
    if (!response.ok) {
      // Use default theater data if API not available
      throw new Error('Theater API not available');
    }
    return response.json();
  })
  .then(theater => {
    displaySeatingLayout(theater);
  })
  .catch(error => {
    console.error('Get theater seating error:', error);
    // Show default seating layout
    const defaultTheater = {
      id: theaterId,
      name: `Theater ${theaterId}`,
      rows: theaterId == 1 ? 20 : 25,
      seatsPerRow: theaterId == 1 ? 12 : 16
    };
    displaySeatingLayout(defaultTheater);
  });
}

function displaySeatingLayout(theater) {
  const modal = document.createElement('div');
  modal.className = 'auth-modal';
  modal.id = 'seatingLayoutModal';
  
  const rows = theater.rows || 20;
  const seatsPerRow = theater.seatsPerRow || 12;
  
  // Generate seating layout
  let seatingHtml = '<div class="seating-layout">';
  
  // Screen
  seatingHtml += '<div class="screen">SCREEN</div>';
  
  // Seats
  for (let row = 1; row <= rows; row++) {
    seatingHtml += `<div class="seat-row">`;
    seatingHtml += `<span class="row-label">${String.fromCharCode(64 + row)}</span>`;
    
    for (let seat = 1; seat <= seatsPerRow; seat++) {
      seatingHtml += `<div class="seat available" title="Row ${String.fromCharCode(64 + row)}, Seat ${seat}"></div>`;
    }
    
    seatingHtml += '</div>';
  }
  
  seatingHtml += '</div>';
  
  modal.innerHTML = `
    <div class="auth-modal-content">
      <button class="auth-modal-close" onclick="closeAuthModal('seatingLayoutModal')">&times;</button>
      <h2>${theater.name || `Theater ${theater.id}`} - Seating Layout</h2>
      <p class="auth-subtitle">${rows} rows × ${seatsPerRow} seats = ${rows * seatsPerRow} total seats</p>
      
      ${seatingHtml}
      
      <div class="seating-legend">
        <div class="legend-item">
          <div class="seat available"></div>
          <span>Available</span>
        </div>
        <div class="legend-item">
          <div class="seat occupied"></div>
          <span>Occupied</span>
        </div>
        <div class="legend-item">
          <div class="seat selected"></div>
          <span>Selected</span>
        </div>
      </div>
      
      <div class="modal-actions" style="margin-top: 1rem;">
        <button class="button" onclick="editTheater('${theater.id || theater.theaterId}')">Edit Theater</button>
        <button class="button" onclick="closeAuthModal('seatingLayoutModal')">Close</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Close modal when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeAuthModal('seatingLayoutModal');
    }
  });
}

// ===== USER/GUEST FUNCTIONS =====
function showMyBookings() {
  if (!checkPermission(['USER', 'GUEST'])) return;
  closeAuthModal('userMenuModal');
  
  content.innerHTML = `
    <div class="management-page">
      <div class="header">
        <h1>🎫 My Bookings</h1>
        <p>View and manage your cinema bookings</p>
      </div>
      
      <div class="management-actions">
        <button class="button" onclick="loadMyBookings()">Refresh Bookings</button>
        <button class="button" onclick="showCreateBookingForm()">New Booking</button>
        <button class="button" onclick="renderHomePage()">Back to Home</button>
      </div>
      
      <div id="bookingsContainer" class="bookings-grid">
        <div class="loading-message">Loading your bookings...</div>
      </div>
    </div>
  `;
  
  loadMyBookings();
}

function loadMyBookings() {
  const container = document.getElementById('bookingsContainer');
  container.innerHTML = '<div class="loading-message">Loading your bookings...</div>';
  
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const userId = currentUser.id || currentUser.userId || currentUser.userID;
  
  if (!userId) {
    container.innerHTML = `
      <div class="error-message">
        <h4>❌ User Not Found</h4>
        <p>Please sign in to view your bookings.</p>
        <button class="button" onclick="showSignInForm()">Sign In</button>
      </div>
    `;
    return;
  }
  
  fetch(`http://localhost:8080/api/bookings/user/${userId}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(bookings => {
    displayMyBookings(bookings);
  })
  .catch(error => {
    console.error('Fetch bookings error:', error);
    container.innerHTML = `
      <div class="error-message">
        <h4>❌ Failed to Load Bookings</h4>
        <p>${error.message}</p>
        <button class="button" onclick="loadMyBookings()">Retry</button>
      </div>
    `;
  });
}

function displayMyBookings(bookings) {
  const container = document.getElementById('bookingsContainer');
  
  if (bookings.length === 0) {
    container.innerHTML = `
      <div class="info-message">
        <h4>🎫 No Bookings Found</h4>
        <p>You haven't made any bookings yet.</p>
        <button class="button" onclick="showCreateBookingForm()">Make Your First Booking</button>
      </div>
    `;
    return;
  }
  
  const bookingsHtml = bookings.map((booking, index) => {
    const bookingId = booking.id || booking.bookingId || booking.bookingID || index;
    const bookingDate = booking.bookingDate || booking.createdDate || 'Unknown date';
    const showTitle = booking.showTitle || booking.movieTitle || 'Unknown Movie';
    const showDate = booking.showDate || booking.date || 'Unknown date';
    const showTime = booking.showTime || booking.time || 'Unknown time';
    const seatNumbers = booking.seatNumbers || booking.seats || [];
    const totalPrice = booking.totalPrice || booking.price || 0;
    
    return `
      <div class="booking-card" style="margin-bottom: 1rem; padding: 1rem; background: var(--surface-color); border-radius: 0.5rem;">
        <div class="booking-card-header">
          <h4>${showTitle}</h4>
          <span class="booking-status ${booking.status || 'confirmed'}">${booking.status || 'CONFIRMED'}</span>
        </div>
        <div class="booking-card-body">
          <p><strong>Show Date:</strong> ${showDate}</p>
          <p><strong>Show Time:</strong> ${showTime}</p>
          <p><strong>Theater:</strong> ${booking.theaterName || booking.theater || 'Unknown Theater'}</p>
          <p><strong>Seats:</strong> ${Array.isArray(seatNumbers) ? seatNumbers.join(', ') : seatNumbers || 'Not specified'}</p>
          <p><strong>Total Price:</strong> $${totalPrice}</p>
          <p><strong>Booking Date:</strong> ${bookingDate}</p>
          
          <div class="booking-card-actions">
            <button class="button small" onclick="viewBookingDetails('${bookingId}')">View Details</button>
            <button class="button small" onclick="editBooking('${bookingId}')">Edit</button>
            <button class="button small danger" onclick="cancelBooking('${bookingId}', '${showTitle}')">Cancel</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
  
  container.innerHTML = `
    <h3>Your Bookings (${bookings.length})</h3>
    <div class="bookings-grid">${bookingsHtml}</div>
  `;
}

function showCreateBookingForm() {
  if (!checkPermission(['USER', 'GUEST'])) return;
  
  // Create booking form modal
  const modal = document.createElement('div');
  modal.className = 'auth-modal';
  modal.id = 'createBookingModal';
  
  modal.innerHTML = `
    <div class="auth-modal-content">
      <button class="auth-modal-close" onclick="closeAuthModal('createBookingModal')">&times;</button>
      <h2>Create New Booking</h2>
      <p class="auth-subtitle">Book tickets for a movie show</p>
      
      <div id="bookingFormStep1">
        <h3>Step 1: Select Show</h3>
        <div id="availableShowsContainer">
          <div class="loading-message">Loading available shows...</div>
        </div>
      </div>
      
      <div id="bookingFormStep2" style="display: none;">
        <h3>Step 2: Select Seats</h3>
        <div id="seatSelectionContainer"></div>
      </div>
      
      <div id="bookingFormStep3" style="display: none;">
        <h3>Step 3: Confirm Booking</h3>
        <form class="auth-form" id="createBookingForm">
          <div id="bookingSummary"></div>
          <button type="submit" class="auth-submit-btn">Confirm Booking</button>
          <button type="button" class="button" onclick="closeAuthModal('createBookingModal')" style="margin-top: 0.5rem;">Cancel</button>
        </form>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Load available shows
  loadAvailableShows();
  
  // Close modal when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeAuthModal('createBookingModal');
    }
  });
}

function loadAvailableShows() {
  const container = document.getElementById('availableShowsContainer');
  
  fetch('http://localhost:8080/api/shows', {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(shows => {
    displayAvailableShows(shows);
  })
  .catch(error => {
    console.error('Fetch shows error:', error);
    container.innerHTML = `
      <div class="error-message">
        <h4>❌ Failed to Load Shows</h4>
        <p>${error.message}</p>
        <button class="button" onclick="loadAvailableShows()">Retry</button>
      </div>
    `;
  });
}

function displayAvailableShows(shows) {
  const container = document.getElementById('availableShowsContainer');
  
  if (shows.length === 0) {
    container.innerHTML = `
      <div class="info-message">
        <h4>🎬 No Shows Available</h4>
        <p>There are currently no shows available for booking.</p>
      </div>
    `;
    return;
  }
  
  const showsHtml = shows.map((show, index) => {
    const showId = show.id || show.showId || show.showID || index;
    
    return `
      <div class="show-option" style="margin-bottom: 1rem; padding: 1rem; background: var(--accent-color-10); border-radius: 0.5rem; cursor: pointer;" onclick="selectShow('${showId}', ${JSON.stringify(show).replace(/"/g, '&quot;')})">
        <h4>${show.title || show.movieTitle || 'Unknown Movie'}</h4>
        <p><strong>Date:</strong> ${show.showDate || show.date || 'Unknown date'}</p>
        <p><strong>Time:</strong> ${show.showTime || show.time || 'Unknown time'}</p>
        <p><strong>Theater:</strong> ${show.theaterName || show.theater || 'Unknown Theater'}</p>
        <p><strong>Price:</strong> ${show.price ? '$' + show.price : 'Price not set'}</p>
      </div>
    `;
  }).join('');
  
  container.innerHTML = `
    <div class="shows-selection">
      ${showsHtml}
    </div>
  `;
}

let selectedShow = null;
let selectedSeats = [];

function selectShow(showId, show) {
  selectedShow = show;
  
  // Hide step 1, show step 2
  document.getElementById('bookingFormStep1').style.display = 'none';
  document.getElementById('bookingFormStep2').style.display = 'block';
  
  // Generate seat selection
  displaySeatSelection(show);
}

function displaySeatSelection(show) {
  const container = document.getElementById('seatSelectionContainer');
  
  const rows = 20; // Default rows
  const seatsPerRow = 12; // Default seats per row
  
  let seatingHtml = '<div class="seat-selection-layout">';
  
  // Screen
  seatingHtml += '<div class="screen">SCREEN</div>';
  
  // Seats
  for (let row = 1; row <= rows; row++) {
    seatingHtml += `<div class="seat-row">`;
    seatingHtml += `<span class="row-label">${String.fromCharCode(64 + row)}</span>`;
    
    for (let seat = 1; seat <= seatsPerRow; seat++) {
      const seatId = `${String.fromCharCode(64 + row)}${seat}`;
      seatingHtml += `<div class="seat available" onclick="toggleSeat('${seatId}')" id="seat-${seatId}" title="Row ${String.fromCharCode(64 + row)}, Seat ${seat}"></div>`;
    }
    
    seatingHtml += '</div>';
  }
  
  seatingHtml += '</div>';
  
  container.innerHTML = `
    <div class="selected-show-info" style="margin-bottom: 1rem; padding: 1rem; background: var(--surface-color); border-radius: 0.5rem;">
      <h4>${show.title || show.movieTitle || 'Unknown Movie'}</h4>
      <p>${show.showDate || show.date} at ${show.showTime || show.time}</p>
      <p>Price per ticket: ${show.price ? '$' + show.price : 'Price not set'}</p>
    </div>
    
    ${seatingHtml}
    
    <div class="seat-selection-info">
      <p>Selected seats: <span id="selectedSeatsDisplay">None</span></p>
      <p>Total price: $<span id="totalPriceDisplay">0.00</span></p>
      <button class="button" onclick="proceedToConfirmation()" id="proceedBtn" disabled>Proceed to Confirmation</button>
      <button class="button" onclick="backToShowSelection()">Back to Show Selection</button>
    </div>
    
    <div class="seating-legend">
      <div class="legend-item">
        <div class="seat available"></div>
        <span>Available</span>
      </div>
      <div class="legend-item">
        <div class="seat selected"></div>
        <span>Selected</span>
      </div>
      <div class="legend-item">
        <div class="seat occupied"></div>
        <span>Occupied</span>
      </div>
    </div>
  `;
}

function toggleSeat(seatId) {
  const seatElement = document.getElementById(`seat-${seatId}`);
  
  if (seatElement.classList.contains('occupied')) {
    return; // Can't select occupied seats
  }
  
  if (selectedSeats.includes(seatId)) {
    // Deselect seat
    selectedSeats = selectedSeats.filter(id => id !== seatId);
    seatElement.classList.remove('selected');
    seatElement.classList.add('available');
  } else {
    // Select seat
    selectedSeats.push(seatId);
    seatElement.classList.remove('available');
    seatElement.classList.add('selected');
  }
  
  updateSeatSelectionDisplay();
}

function updateSeatSelectionDisplay() {
  const display = document.getElementById('selectedSeatsDisplay');
  const totalDisplay = document.getElementById('totalPriceDisplay');
  const proceedBtn = document.getElementById('proceedBtn');
  
  if (selectedSeats.length === 0) {
    display.textContent = 'None';
    totalDisplay.textContent = '0.00';
    proceedBtn.disabled = true;
  } else {
    display.textContent = selectedSeats.join(', ');
    const ticketPrice = parseFloat(selectedShow.price || 0);
    const total = selectedSeats.length * ticketPrice;
    totalDisplay.textContent = total.toFixed(2);
    proceedBtn.disabled = false;
  }
}

function backToShowSelection() {
  document.getElementById('bookingFormStep2').style.display = 'none';
  document.getElementById('bookingFormStep1').style.display = 'block';
  selectedSeats = [];
}

function proceedToConfirmation() {
  if (selectedSeats.length === 0) {
    alert('Please select at least one seat');
    return;
  }
  
  // Hide step 2, show step 3
  document.getElementById('bookingFormStep2').style.display = 'none';
  document.getElementById('bookingFormStep3').style.display = 'block';
  
  // Display booking summary
  displayBookingSummary();
}

function displayBookingSummary() {
  const container = document.getElementById('bookingSummary');
  const ticketPrice = parseFloat(selectedShow.price || 0);
  const total = selectedSeats.length * ticketPrice;
  
  container.innerHTML = `
    <div class="booking-summary">
      <h4>Booking Summary</h4>
      <div class="summary-row">
        <strong>Movie:</strong> ${selectedShow.title || selectedShow.movieTitle || 'Unknown Movie'}
      </div>
      <div class="summary-row">
        <strong>Date & Time:</strong> ${selectedShow.showDate || selectedShow.date} at ${selectedShow.showTime || selectedShow.time}
      </div>
      <div class="summary-row">
        <strong>Theater:</strong> ${selectedShow.theaterName || selectedShow.theater || 'Unknown Theater'}
      </div>
      <div class="summary-row">
        <strong>Selected Seats:</strong> ${selectedSeats.join(', ')}
      </div>
      <div class="summary-row">
        <strong>Number of Tickets:</strong> ${selectedSeats.length}
      </div>
      <div class="summary-row">
        <strong>Price per Ticket:</strong> $${ticketPrice.toFixed(2)}
      </div>
      <div class="summary-row total">
        <strong>Total Price: $${total.toFixed(2)}</strong>
      </div>
    </div>
  `;
  
  // Add form submit handler
  const form = document.getElementById('createBookingForm');
  form.addEventListener('submit', handleCreateBooking);
}

function handleCreateBooking(event) {
  event.preventDefault();
  
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const userId = currentUser.id || currentUser.userId || currentUser.userID;
  
  if (!userId) {
    alert('Please sign in to make a booking');
    return;
  }
  
  const ticketPrice = parseFloat(selectedShow.price || 0);
  const total = selectedSeats.length * ticketPrice;
  
  const bookingData = {
    userId: userId,
    showId: selectedShow.id || selectedShow.showId || selectedShow.showID,
    seatNumbers: selectedSeats,
    numberOfTickets: selectedSeats.length,
    totalPrice: total,
    bookingDate: new Date().toISOString().split('T')[0]
  };
  
  const submitBtn = event.target.querySelector('.auth-submit-btn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Creating Booking...';
  
  fetch('http://localhost:8080/api/bookings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(bookingData)
  })
  .then(response => {
    if (!response.ok) {
      return response.text().then(text => {
        throw new Error(`Failed to create booking: ${text}`);
      });
    }
    return response.text();
  })
  .then(result => {
    alert('Booking created successfully!');
    closeAuthModal('createBookingModal');
    // Refresh bookings if on the bookings page
    if (document.getElementById('bookingsContainer')) {
      loadMyBookings();
    }
    // Reset selections
    selectedShow = null;
    selectedSeats = [];
    submitBtn.disabled = false;
    submitBtn.textContent = 'Confirm Booking';
  })
  .catch(error => {
    console.error('Create booking error:', error);
    alert(`Failed to create booking: ${error.message}`);
    submitBtn.disabled = false;
    submitBtn.textContent = 'Confirm Booking';
  });
}

function editBooking(bookingId) {
  // Get booking details first
  fetch(`http://localhost:8080/api/bookings/${bookingId}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`Failed to get booking details: ${response.status}`);
    }
    return response.json();
  })
  .then(booking => {
    showEditBookingModal(booking);
  })
  .catch(error => {
    console.error('Get booking error:', error);
    alert(`Failed to load booking details: ${error.message}`);
  });
}

function showEditBookingModal(booking) {
  alert('Edit booking functionality would allow users to modify their seat selection or show time (if available). This would integrate with your BookingController PUT endpoint.');
}



function viewBookingDetails(bookingId) {
  // Get booking details and display in modal
  fetch(`http://localhost:8080/api/bookings/${bookingId}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`Failed to get booking details: ${response.status}`);
    }
    return response.json();
  })
  .then(booking => {
    displayBookingDetailsModal(booking);
  })
  .catch(error => {
    console.error('Get booking details error:', error);
    alert(`Failed to load booking details: ${error.message}`);
  });
}

function displayBookingDetailsModal(booking) {
  const modal = document.createElement('div');
  modal.className = 'auth-modal';
  modal.id = 'bookingDetailsModal';
  
  const seatNumbers = booking.seatNumbers || booking.seats || [];
  
  modal.innerHTML = `
    <div class="auth-modal-content">
      <button class="auth-modal-close" onclick="closeAuthModal('bookingDetailsModal')">&times;</button>
      <h2>Booking Details</h2>
      
      <div class="booking-details">
        <h3>${booking.showTitle || booking.movieTitle || 'Unknown Movie'}</h3>
        <div class="detail-row">
          <strong>Booking ID:</strong> ${booking.id || booking.bookingId || booking.bookingID}
        </div>
        <div class="detail-row">
          <strong>Show Date:</strong> ${booking.showDate || booking.date || 'Unknown date'}
        </div>
        <div class="detail-row">
          <strong>Show Time:</strong> ${booking.showTime || booking.time || 'Unknown time'}
        </div>
        <div class="detail-row">
          <strong>Theater:</strong> ${booking.theaterName || booking.theater || 'Unknown Theater'}
        </div>
        <div class="detail-row">
          <strong>Seats:</strong> ${Array.isArray(seatNumbers) ? seatNumbers.join(', ') : seatNumbers || 'Not specified'}
        </div>
        <div class="detail-row">
          <strong>Number of Tickets:</strong> ${booking.numberOfTickets || seatNumbers.length || 1}
        </div>
        <div class="detail-row">
          <strong>Total Price:</strong> $${booking.totalPrice || booking.price || 0}
        </div>
        <div class="detail-row">
          <strong>Booking Date:</strong> ${booking.bookingDate || booking.createdDate || 'Unknown date'}
        </div>
        <div class="detail-row">
          <strong>Status:</strong> <span class="booking-status ${booking.status || 'confirmed'}">${booking.status || 'CONFIRMED'}</span>
        </div>
      </div>
      
      <div class="modal-actions" style="margin-top: 1rem;">
        <button class="button" onclick="editBooking('${booking.id || booking.bookingId || booking.bookingID}')">Edit Booking</button>
        <button class="button danger" onclick="cancelBooking('${booking.id || booking.bookingId || booking.bookingID}', '${booking.showTitle || booking.movieTitle || 'this show'}'); closeAuthModal('bookingDetailsModal')">Cancel Booking</button>
        <button class="button" onclick="closeAuthModal('bookingDetailsModal')">Close</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Close modal when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeAuthModal('bookingDetailsModal');
    }
  });
}

function viewAvailableShows() {
  if (!checkPermission(['USER', 'GUEST'])) return;
  closeAuthModal('userMenuModal');
  
  content.innerHTML = `
    <div class="management-page">
      <div class="header">
        <h1>🎭 Available Shows</h1>
        <p>Browse and book available shows</p>
      </div>
      
      <div class="management-actions">
        <button class="button" onclick="loadAvailableShows()">Refresh Shows</button>
        <button class="button" onclick="renderHomePage()">Back to Home</button>
      </div>
      
      <div id="availableShowsContainer" class="shows-grid">
        <div class="loading-message">Loading available shows...</div>
      </div>
    </div>
  `;
  
  // This will integrate with your ShowController to get available shows
  document.getElementById('availableShowsContainer').innerHTML = `
    <div class="info-message">
      <h3>🎭 Available Shows</h3>
      <p>Available shows functionality will integrate with your ShowController API endpoints.</p>
    </div>
  `;
}

function loadMyBookings() {
  // This will integrate with your BookingController GET endpoint
  alert('Load user bookings - integrates with BookingController GET /api/bookings/user/{userId}');
}

function loadAvailableShows() {
  // This will integrate with your ShowController GET endpoint
  alert('Load available shows - integrates with ShowController GET /api/shows/available');
}
