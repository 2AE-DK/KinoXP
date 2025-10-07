
  fetch(window.location.href)
    .then(response => {
      if (!response.ok) {
        
        window.location.href = "error.html";
      }
    })
    .catch(error => {
    
      window.location.href = "error.html";
    });
