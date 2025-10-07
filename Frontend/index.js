const content = document.getElementById('content');

renderHomePage();

function renderHomePage() {
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
      <input type="text" placeholder="Search for a movie..." class="search-bar">
      <button class="search-button"></button>
    </div>
  `;
}

