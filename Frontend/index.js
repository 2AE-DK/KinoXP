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

// Setup authentication buttons (Sign up and Sign in)
function setupAuthButtons() {
  // Create container for auth buttons
  const authContainer = document.createElement('div');
  authContainer.className = 'auth-buttons-container';
  
  // Create Sign Up button
  const signUpBtn = document.createElement('button');
  signUpBtn.className = 'auth-button auth-button-signup';
  signUpBtn.textContent = 'Sign up';
  signUpBtn.addEventListener('click', showSignUpForm);
  
  // Create Sign In button
  const signInBtn = document.createElement('button');
  signInBtn.className = 'auth-button auth-button-signin';
  signInBtn.textContent = 'Sign in';
  signInBtn.addEventListener('click', showSignInForm);
  
  // Append buttons to container
  authContainer.appendChild(signUpBtn);
  authContainer.appendChild(signInBtn);
  
  // Append container to body
  document.body.appendChild(authContainer);
}

// Show Sign Up Form
function showSignUpForm() {
  // Create modal overlay
  const modal = document.createElement('div');
  modal.className = 'auth-modal';
  modal.id = 'signUpModal';
  
  modal.innerHTML = `
    <div class="auth-modal-content">
      <button class="auth-modal-close" onclick="closeAuthModal('signUpModal')">&times;</button>
      <h2>Sign Up</h2>
      <p class="auth-subtitle">Create your account to get started</p>
      
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
          <input type="password" id="signupPassword" name="password" placeholder="Create a password" required>
        </div>
        
        <button type="submit" class="auth-submit-btn">Create Account</button>
      </form>
      
      <p class="auth-switch">
        Already have an account? 
        <a href="#" onclick="switchToSignIn(event)">Sign in</a>
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
  // Create modal overlay
  const modal = document.createElement('div');
  modal.className = 'auth-modal';
  modal.id = 'signInModal';
  
  modal.innerHTML = `
    <div class="auth-modal-content">
      <button class="auth-modal-close" onclick="closeAuthModal('signInModal')">&times;</button>
      <h2>Sign In</h2>
      <p class="auth-subtitle">Welcome back! Please sign in to continue</p>
      
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
        <a href="#" onclick="switchToSignUp(event)">Sign up</a>
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

// Close authentication modal
function closeAuthModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.remove();
  }
}

// Switch from Sign Up to Sign In
function switchToSignIn(event) {
  event.preventDefault();
  closeAuthModal('signUpModal');
  showSignInForm();
}

// Switch from Sign In to Sign Up
function switchToSignUp(event) {
  event.preventDefault();
  closeAuthModal('signInModal');
  showSignUpForm();
}

// Handle Sign Up form submission
function handleSignUp(event) {
  event.preventDefault();
  
  const email = document.getElementById('signupEmail').value;
  const username = document.getElementById('signupUsername').value;
  const password = document.getElementById('signupPassword').value;
  
  console.log('Sign Up Data:', { email, username, password });
  
  // Disable submit button to prevent double submission
  const submitBtn = event.target.querySelector('.auth-submit-btn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Creating Account...';
  
  // Call backend register API
  fetch('http://localhost:8080/api/users/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      email: email, 
      username: username, 
      password: password,
      role: 'USER'  // Default role
    })
  })
  .then(response => {
    if (!response.ok) {
      // Handle error responses (409 Conflict, etc.)
      return response.text().then(errorMsg => {
        throw new Error(errorMsg);
      });
    }
    return response.json();
  })
  .then(data => {
    console.log('Sign up successful:', data);
    closeAuthModal('signUpModal');
    alert(`Account created successfully!\nWelcome, ${username}!`);
    // Optionally automatically sign in the user
  })
  .catch(error => {
    console.error('Sign up error:', error);
    alert(`Sign up failed: ${error.message}`);
    // Re-enable button
    submitBtn.disabled = false;
    submitBtn.textContent = 'Create Account';
  });
}

// Handle Sign In form submission
function handleSignIn(event) {
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
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      email: email,
      password: password 
    })
  })
  .then(response => {
    if (!response.ok) {
      // Handle error responses (401 Unauthorized, etc.)
      return response.text().then(errorMsg => {
        throw new Error(errorMsg);
      });
    }
    return response.text();  // Backend returns plain text "Login successful"
  })
  .then(message => {
    console.log('Sign in successful:', message);
    closeAuthModal('signInModal');
    alert(`Welcome back!\n${message}`);
    // Store user session
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userEmail', email);
    // Optionally update UI to show user is logged in
  })
  .catch(error => {
    console.error('Sign in error:', error);
    alert(`Sign in failed: ${error.message}`);
    // Re-enable button
    submitBtn.disabled = false;
    submitBtn.textContent = 'Sign In';
  });
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
}