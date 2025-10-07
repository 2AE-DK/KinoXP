function renderErrorPage() {
  content.innerHTML = `
  <section class="header" aria-labelledby="error-title">
    <h1 id="error-title">Der er sket en fejl</h1>
    <p>Vi beklager ulejligheden. Prøv igen senere, eller gå tilbage til forsiden.</p>
  </section>

  <!-- Knap til forsiden -->
  <a class="error-button" href="" role="button" aria-label="Tilbage til forsiden">
    Til forsiden
  </a>
  `
}
