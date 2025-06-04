// Script om gebruikersinfo op te halen en te tonen
async function updateUserInfo() {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      // Als er geen token is, stuur de gebruiker terug naar de login pagina
      window.location.href = "login.html";
      return;
    }

    // Haal de gebruikersinfo op
    const res = await fetch("/api/leerling/userinfo", {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        // Ongeldige token of geen leerling
        localStorage.clear();
        window.location.href = "login.html";
        return;
      }
      throw new Error("Kon gebruikersinfo niet ophalen");
    }

    const userData = await res.json();
    
    // Update alle elementen met de class 'user-name' met de voornaam
    const userNameElements = document.querySelectorAll('.user-info span');
    userNameElements.forEach(el => {
      el.textContent = userData.voornaam;
    });

    // Update de avatar letter (eerste letter van de voornaam)
    const userAvatarElements = document.querySelectorAll('.user-avatar');
    userAvatarElements.forEach(el => {
      el.textContent = userData.voornaam.charAt(0);
    });
  } catch (error) {
    console.error("Fout bij het ophalen van gebruikersinfo:", error);
  }
}

// Voer de functie uit zodra het document geladen is
document.addEventListener('DOMContentLoaded', updateUserInfo);
