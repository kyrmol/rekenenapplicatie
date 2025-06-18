// Script om voortgang van leerling te laden
async function loadStudentProgress() {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Geen token gevonden, voortgang kan niet worden geladen");
      window.location.href = "login.html";
      return;
    }

    // Haal de scores op van de API
    const response = await fetch("/api/scores/student", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error("Kon scores niet ophalen: " + response.statusText);
    }

    const scores = await response.json();

    // Groepeer scores per spel
    const scoresByGame = {};
    scores.forEach(score => {
      if (!scoresByGame[score.spel_id]) {
        scoresByGame[score.spel_id] = [];
      }
      scoresByGame[score.spel_id].push(score);
    });

    // De lijst met alle spellen voor het geval dat we geen scores hebben
    const allGames = [
      { id: 1, naam: "Reken Race" },
      { id: 2, naam: "Kassaspel" },
      { id: 3, naam: "Breukenpuzzel" },
      { id: 4, naam: "Tafel Spel" }
    ];

    const progressList = document.getElementById('progress-list');
    progressList.innerHTML = ""; // Leeg de lijst

    // Voor elk spel, maak een voortgangsitem
    allGames.forEach(game => {
      const gameScores = scoresByGame[game.id] || [];

      // Bereken statistieken
      const highestScore = gameScores.length > 0 ? Math.max(...gameScores.map(s => s.score)) : 0;
      const avgScore = gameScores.length > 0 ? gameScores.reduce((sum, s) => sum + s.score, 0) / gameScores.length : 0;
      const attempts = gameScores.length;

      // Progress percentage (based on highest score)
      const progressPercentage = Math.min(100, highestScore);

      // Create HTML element
      const progressItem = document.createElement('div');
      progressItem.className = 'progress-item';

      // Maak een uniek ID voor de details sectie
      const detailsId = game.naam.toLowerCase().replace(/\s+/g, '-');

      progressItem.innerHTML = `
        <div class="progress-header">
          <div class="spel-naam">${game.naam}</div>
          <button class="details-btn" onclick="toggleDetails('${detailsId}')">Details</button>
        </div>
        <div class="progress-bar">
          <div class="progress" style="width: ${progressPercentage}%;"></div>
        </div>
        <div class="stats">
          <div class="stat-item">
            <div>Hoogste score</div>
            <div class="stat-value">${highestScore}</div>
          </div>
          <div class="stat-item">
            <div>Gemiddelde</div>
            <div class="stat-value">${Math.round(avgScore)}</div>
          </div>
          <div class="stat-item">
            <div>Aantal pogingen</div>
            <div class="stat-value">${attempts}</div>
          </div>
        </div>
        <div class="details-container" id="details-${detailsId}">
          <h4>Recente scores:</h4>
          ${gameScores.slice(0, 5).map(score => `
            <div class="score-detail">
              <div>${formatDate(score.datum)}</div>
              <div><strong>${score.score} punten</strong></div>
            </div>
          `).join('') || '<div class="no-data">Nog geen scores beschikbaar</div>'}
        </div>
      `;

      progressList.appendChild(progressItem);
    });

  } catch (error) {
    console.error("Fout bij laden van voortgang:", error);
    const progressList = document.getElementById('progress-list');
    progressList.innerHTML = `
      <div class="error-message">
        Er is een fout opgetreden bij het laden van je voortgang. 
        Probeer het later opnieuw of neem contact op met je docent.
      </div>
    `;
  }
}

// Hulpfunctie om datum netjes te formatteren
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('nl-NL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

// Laad voortgang wanneer de pagina geladen is
document.addEventListener('DOMContentLoaded', loadStudentProgress);
