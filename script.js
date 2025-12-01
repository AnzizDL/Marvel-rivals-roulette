// ============================================
// BASE DE DONNÉES DES HÉROS MARVEL RIVALS
// ============================================
const heroes = {
  // VANGUARDS (TANKS) - 12 héros
  tank: [
    "Angela",
    "Anziz",
    "Captain America",
    "Doctor Strange",
    "Emma Frost",
    "Groot",
    "Hulk",
    "Magneto",
    "Peni Parker",
    "La Chose",
    "Thor",
    "Venom",
  ],

  // DUELISTS (DPS) - 23 héros
  dps: [
    "Black Panther",
    "Black Widow",
    "Blade",
    "Hawkeye",
    "Hela",
    "La Torche",
    "Iron Fist",
    "Iron Man",
    "Jean-Luc",
    "Magik",
    "Mister Fantastic",
    "Moon Knight",
    "Namor",
    "Nayel",
    "Phoenix",
    "Psylocke",
    "Wanda",
    "Spider-Man",
    "Squirrel Girl",
    "Star-Lord",
    "Storm",
    "The Punisher",
    "Winter Soldier",
    "Wolverine",
  ],

  // STRATEGISTS (SUPPORT/HEAL) - 9 héros
  healer: [
    "Adam Warlock",
    "Cloak & Dagger",
    "Invisible Woman",
    "Jeff",
    "Loki",
    "Luna Snow",
    "Mantis",
    "Rocket Raccoon",
    "Ultron",
  ],
};

// ============================================
// CONFIGURATION DES RÔLES ET COULEURS
// ============================================
const roleConfig = {
  tank: {
    name: "TANK",
    color: "#4A90E2", // Bleu doux
  },
  dps: {
    name: "DPS",
    color: "#E74C3C", // Rouge doux
  },
  healer: {
    name: "HEALER",
    color: "#2ECC71", // Vert doux
  },
};

// ============================================
// VARIABLES GLOBALES
// ============================================
let currentFilter = "all"; // Filtre actuel (all, tank, dps, healer)
let isAnimating = false; // Empêche les clics multiples pendant l'animation

// Paramètres et état étendus
let settings = {
  noRepeat: false,
  speed: "normal", // 'fast' | 'normal' | 'slow'
};

let usedHeroesByFilter = {
  all: new Set(),
  tank: new Set(),
  dps: new Set(),
  healer: new Set(),
};

let history = [];
let searchQuery = "";

// ============================================
// ÉLÉMENTS DOM PRINCIPAUX
// ============================================
const roleButtons = document.querySelectorAll(".role-btn");
const randomButton = document.getElementById("randomBtn");
const heroCard = document.getElementById("heroCard");
const heroName = document.getElementById("heroName");
const heroRoleBadge = document.getElementById("heroRoleBadge");
const heroAnimation = document.getElementById("heroAnimation");
const heroesGrid = document.getElementById("heroesGrid");
const resultSection = document.getElementById("resultSection");
// Nouveaux éléments UI
const noRepeatToggle = document.getElementById("noRepeatToggle");
const speedSelect = document.getElementById("speedSelect");
const resetHistoryBtn = document.getElementById("resetHistoryBtn");
const searchInput = document.getElementById("searchInput");
const historyList = document.getElementById("historyList");

// ============================================
// INITIALISATION DE L'APPLICATION
// ============================================
document.addEventListener("DOMContentLoaded", function () {
  initializeApp();
  setupEventListeners();
  generateHeroesGrid();
  updateStats();
  loadSettings();
  applySettingsToUI();
  renderHistory();
});

function initializeApp() {
  console.log("🚀 Marvel Rivals Hero Selector initialisé");
  console.log(`📊 Total des héros: ${getTotalHeroesCount()}`);

  // Animation d'entrée pour le titre (optionnel)
  setTimeout(() => {
    document.querySelector(".main-title").style.animation =
      "titleGlow 2s ease-in-out infinite alternate";
  }, 500);
}

// ============================================
// GESTION DES ÉVÉNEMENTS
// ============================================
function setupEventListeners() {
  // Boutons de filtres de rôles
  roleButtons.forEach((btn) => {
    btn.addEventListener("click", () => handleRoleFilter(btn));
  });

  // Bouton de sélection aléatoire
  randomButton.addEventListener("click", selectRandomHero);

  // Raccourcis clavier
  document.addEventListener("keydown", handleKeyboard);

  // Paramètres
  if (noRepeatToggle) {
    noRepeatToggle.addEventListener("change", () => {
      settings.noRepeat = noRepeatToggle.checked;
      saveSettings();
    });
  }
  if (speedSelect) {
    speedSelect.addEventListener("change", () => {
      settings.speed = speedSelect.value;
      saveSettings();
    });
  }
  if (resetHistoryBtn) {
    resetHistoryBtn.addEventListener("click", () => {
      history = [];
      usedHeroesByFilter = {
        all: new Set(),
        tank: new Set(),
        dps: new Set(),
        healer: new Set(),
      };
      renderHistory();
      localStorage.removeItem("mr_history");
    });
  }
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      searchQuery = searchInput.value.trim().toLowerCase();
      generateHeroesGrid();
    });
  }
}

// ============================================
// PERSISTENCE DES PARAMÈTRES / HISTORIQUE
// ============================================
function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem("mr_settings") || "{}");
    settings = { ...settings, ...saved };
    const savedHistory = JSON.parse(localStorage.getItem("mr_history") || "[]");
    if (Array.isArray(savedHistory)) history = savedHistory;
  } catch (e) {
    console.warn("Settings load error", e);
  }
}

function saveSettings() {
  localStorage.setItem("mr_settings", JSON.stringify(settings));
}

function saveHistory() {
  localStorage.setItem("mr_history", JSON.stringify(history.slice(0, 20)));
}

function applySettingsToUI() {
  if (noRepeatToggle) noRepeatToggle.checked = !!settings.noRepeat;
  if (speedSelect) speedSelect.value = settings.speed || "normal";
}

// Gestion des raccourcis clavier
function handleKeyboard(e) {
  if (e.code === "Space") {
    e.preventDefault();
    selectRandomHero();
  }

  switch (e.key) {
    case "1":
      document.querySelector('[data-role="tank"]').click();
      break;
    case "2":
      document.querySelector('[data-role="dps"]').click();
      break;
    case "3":
      document.querySelector('[data-role="healer"]').click();
      break;
    case "0":
      document.querySelector('[data-role="all"]').click();
      break;
    case "r":
    case "R":
      selectRandomHero();
      break;
  }
}

// ============================================
// GESTION DES FILTRES PAR RÔLE
// ============================================
function handleRoleFilter(clickedBtn) {
  if (isAnimating) return;

  const role = clickedBtn.dataset.role;

  // Mise à jour du bouton actif
  roleButtons.forEach((btn) => btn.classList.remove("active"));
  clickedBtn.classList.add("active");

  currentFilter = role;

  // Animation de transition douce
  heroesGrid.style.opacity = "0.5";
  setTimeout(() => {
    generateHeroesGrid();
    heroesGrid.style.opacity = "1";
  }, 200);

  // Feedback visuel simple
  clickedBtn.style.transform = "scale(0.95)";
  setTimeout(() => {
    clickedBtn.style.transform = "";
  }, 150);
}

// ============================================
// SÉLECTION ALÉATOIRE D'UN HÉROS AVEC SUSPENSE
// ============================================
function selectRandomHero() {
  if (isAnimating) return;

  isAnimating = true;

  // Animation du bouton
  animateRandomButton();

  // Obtenir la liste des héros selon le filtre
  let availableHeroes = getFilteredHeroes();

  // Appliquer la recherche
  if (searchQuery) {
    availableHeroes = availableHeroes.filter((h) =>
      h.name.toLowerCase().includes(searchQuery)
    );
  }

  // Appliquer l'option sans répétition
  if (settings.noRepeat) {
    const key = currentFilter === "all" ? "all" : currentFilter;
    const used = usedHeroesByFilter[key];
    const pool = availableHeroes.filter((h) => !used.has(h.name));
    if (pool.length > 0) {
      availableHeroes = pool;
    } else {
      // Si tout a été utilisé, on réinitialise juste pour ce filtre
      usedHeroesByFilter[key].clear();
    }
  }

  if (availableHeroes.length === 0) {
    console.warn("Aucun héros disponible pour le filtre sélectionné");
    isAnimating = false;
    return;
  }

  // Démarrer l'animation de roulette avec suspense
  startSuspenseAnimation(availableHeroes);
}

// Animation de suspense avec roulette
function startSuspenseAnimation(availableHeroes) {
  const heroName = document.getElementById("heroName");
  const heroCard = document.getElementById("heroCard");
  const heroRoleBadge = document.getElementById("heroRoleBadge");

  // Préparer la carte pour l'animation
  heroCard.classList.add("suspense-active");
  heroRoleBadge.style.opacity = "0";

  let animationStep = 0;
  const timings = getAnimationTimings();
  const totalSteps = timings.totalSteps;
  const baseDelay = timings.baseDelay;
  const inc = timings.inc;

  function showRandomPreview() {
    if (animationStep < totalSteps) {
      // Choisir un héros aléatoire pour l'aperçu
      const previewIndex = Math.floor(Math.random() * availableHeroes.length);
      const previewHero = availableHeroes[previewIndex];
      const previewRole = getHeroRole(previewHero.name);

      // Mettre à jour l'affichage temporaire
      heroName.textContent = previewHero.name;
      heroName.classList.add("suspense-flash");
      heroCard.style.borderColor = roleConfig[previewRole].color;

      // Supprimer l'effet flash
      setTimeout(() => {
        heroName.classList.remove("suspense-flash");
      }, 30);

      animationStep++;

      // Délai qui augmente progressivement pour créer le suspense
      const delay = baseDelay + animationStep * inc;
      setTimeout(showRandomPreview, delay);
    } else {
      // Animation terminée, choisir le vrai héros final
      setTimeout(() => {
        revealFinalHero(availableHeroes, timings);
      }, timings.pauseDelay);
    }
  }

  // Démarrer l'animation de suspense
  showRandomPreview();
}

// Révélation finale dramatique
function revealFinalHero(availableHeroes, timings) {
  const heroName = document.getElementById("heroName");
  const heroCard = document.getElementById("heroCard");

  // Pause dramatique
  heroName.textContent = "...";
  heroCard.classList.add("final-suspense");

  setTimeout(() => {
    // Sélectionner le héros final
    const finalIndex = Math.floor(Math.random() * availableHeroes.length);
    const selectedHero = availableHeroes[finalIndex];

    // Nettoyer les classes d'animation
    heroCard.classList.remove("suspense-active", "final-suspense");
    heroCard.classList.add("final-reveal");

    // Afficher le résultat final
    displaySelectedHero(selectedHero);

    // Nettoyer après l'animation
    setTimeout(() => {
      heroCard.classList.remove("final-reveal");
    }, timings.revealDuration);
  }, timings.finalDelay);
}

// Timings dynamiques selon la vitesse
function getAnimationTimings() {
  switch (settings.speed) {
    case "fast":
      return {
        totalSteps: 4,
        baseDelay: 30,
        inc: 15,
        pauseDelay: 100,
        finalDelay: 80,
        revealDuration: 250,
      };
    case "slow":
      return {
        totalSteps: 8,
        baseDelay: 50,
        inc: 30,
        pauseDelay: 300,
        finalDelay: 250,
        revealDuration: 500,
      };
    case "normal":
    default:
      return {
        totalSteps: 6,
        baseDelay: 40,
        inc: 20,
        pauseDelay: 150,
        finalDelay: 120,
        revealDuration: 350,
      };
  }
}

// Animation simple du bouton
function animateRandomButton() {
  const btnText = randomButton.querySelector(".btn-text");

  // Changement de texte temporaire
  btnText.textContent = "SÉLECTION...";
  randomButton.style.pointerEvents = "none";

  // Retour à la normale
  setTimeout(() => {
    btnText.textContent = "SÉLECTIONNER UN HÉROS";
    randomButton.style.pointerEvents = "auto";
    isAnimating = false;
  }, 800);
}

// ============================================
// AFFICHAGE DU HÉROS SÉLECTIONNÉ
// ============================================
function displaySelectedHero(selectedHero) {
  // Déterminer le rôle du héros
  const heroRole = getHeroRole(selectedHero.name);

  // Réinitialiser les classes
  heroCard.className = "hero-card";
  heroName.className = "hero-name";
  heroRoleBadge.className = "hero-role-badge";

  // Animation d'entrée simple
  setTimeout(() => {
    heroCard.classList.add("active");

    // Mise à jour du contenu
    heroName.textContent = selectedHero.name;

    // Badge de rôle
    heroRoleBadge.textContent = roleConfig[heroRole].name;
    heroRoleBadge.classList.add("show", heroRole);

    // Couleur de la carte selon le rôle
    heroCard.style.borderColor = roleConfig[heroRole].color;
  }, 100);

  // Enregistrer historique et répétitions
  trackSelection(selectedHero);
  renderHistory();
  // Mise en évidence dans la grille
  highlightHeroInGrid(selectedHero.name);
}

// ============================================
// MISE EN ÉVIDENCE DANS LA GRILLE
// ============================================
function highlightHeroInGrid(heroName) {
  const gridCards = document.querySelectorAll(".hero-grid-card");

  // Réinitialiser tous les highlights
  gridCards.forEach((card) => {
    card.classList.remove("highlighted");
    card.style.transform = "";
    card.style.boxShadow = "";
  });

  // Trouver et mettre en évidence le héros sélectionné
  gridCards.forEach((card) => {
    if (card.querySelector(".hero-grid-name").textContent === heroName) {
      card.style.transform = "scale(1.05)";
      card.style.border = "3px solid #AEB6BF";

      // Retour à la normale après 2 secondes
      setTimeout(() => {
        card.style.transform = "";
        card.style.border = "";
      }, 2000);
    }
  });
}

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

// Obtenir la liste filtrée des héros
function getFilteredHeroes() {
  if (currentFilter === "all") {
    return getAllHeroes();
  }
  return (
    heroes[currentFilter]?.map((name) => ({ name, role: currentFilter })) || []
  );
}

// Obtenir tous les héros
function getAllHeroes() {
  const allHeroes = [];
  Object.keys(heroes).forEach((role) => {
    heroes[role].forEach((name) => {
      allHeroes.push({ name, role });
    });
  });
  return allHeroes;
}

// Déterminer le rôle d'un héros
function getHeroRole(heroName) {
  for (const [role, heroList] of Object.entries(heroes)) {
    if (heroList.includes(heroName)) {
      return role;
    }
  }
  return "dps"; // Valeur par défaut
}

// Compter le total des héros
function getTotalHeroesCount() {
  return Object.values(heroes).reduce(
    (total, roleHeroes) => total + roleHeroes.length,
    0
  );
}

// ============================================
// GÉNÉRATION DE LA GRILLE DES HÉROS
// ============================================
function generateHeroesGrid() {
  let filteredHeroes = getFilteredHeroes();
  if (searchQuery) {
    filteredHeroes = filteredHeroes.filter((h) =>
      h.name.toLowerCase().includes(searchQuery)
    );
  }
  heroesGrid.innerHTML = "";

  filteredHeroes.forEach((hero) => {
    const card = createHeroGridCard(hero);
    heroesGrid.appendChild(card);
  });

  // Animation d'apparition simple
  const cards = heroesGrid.querySelectorAll(".hero-grid-card");
  cards.forEach((card, index) => {
    card.style.opacity = "0";
    card.style.transform = "translateY(10px)";

    setTimeout(() => {
      card.style.transition = "all 0.3s ease";
      card.style.opacity = "1";
      card.style.transform = "translateY(0)";
    }, index * 30);
  });
}

// ============================================
// HISTORIQUE ET RÉPÉTITIONS
// ============================================
function trackSelection(hero) {
  const role = getHeroRole(hero.name);
  // Marquer comme utilisé si noRepeat
  if (settings.noRepeat) {
    const key = currentFilter === "all" ? "all" : role;
    usedHeroesByFilter[key].add(hero.name);
  }
  // Ajouter à l'historique (début de tableau)
  history.unshift({ name: hero.name, role, ts: Date.now() });
  if (history.length > 20) history.length = 20;
  saveHistory();
}

function renderHistory() {
  if (!historyList) return;
  historyList.innerHTML = "";
  history.slice(0, 12).forEach((item) => {
    const div = document.createElement("div");
    div.className =
      "flex items-center justify-between gap-2 px-3 py-2 rounded-md border text-white text-sm bg-[rgba(52,73,94,0.9)] border-[#566573]";
    const badgeClass =
      item.role === "tank"
        ? "bg-[#2C3E50]"
        : item.role === "dps"
        ? "bg-[#C0392B]"
        : "bg-[#16A085]";
    div.innerHTML = `
            <span class="truncate">${item.name}</span>
            <span class="px-2 py-0.5 rounded text-xs ${badgeClass}">${
      roleConfig[item.role].name
    }</span>
        `;
    historyList.appendChild(div);
  });
}

// Créer une carte de héros pour la grille
function createHeroGridCard(hero) {
  const card = document.createElement("div");
  card.className = `hero-grid-card ${hero.role}`;

  card.innerHTML = `
        <div class="hero-grid-name">${hero.name}</div>
        <div class="hero-grid-role ${hero.role}">${
    roleConfig[hero.role].name
  }</div>
    `;

  // Clic pour sélectionner directement
  card.addEventListener("click", () => {
    if (!isAnimating) {
      displaySelectedHero(hero);
    }
  });

  return card;
}

// ============================================
// MISE À JOUR DES STATISTIQUES
// ============================================
function updateStats() {
  const tankCount = document.getElementById("tankCount");
  const dpsCount = document.getElementById("dpsCount");
  const healerCount = document.getElementById("healerCount");

  // Mise à jour simple des compteurs
  tankCount.textContent = heroes.tank.length;
  dpsCount.textContent = heroes.dps.length;
  healerCount.textContent = heroes.healer.length;

  // Debug pour vérifier les compteurs
  console.log("Stats mises à jour:", {
    tanks: heroes.tank.length,
    dps: heroes.dps.length,
    healers: heroes.healer.length,
  });
}

// ============================================
// FONCTIONS DE DEBUG (OPTIONNELLES)
// ============================================
function debugHeroes() {
  console.log("🦸‍♂️ Debug des héros:");
  console.log("Tanks:", heroes.tank.length, heroes.tank);
  console.log("DPS:", heroes.dps.length, heroes.dps);
  console.log("Healers:", heroes.healer.length, heroes.healer);
  console.log("Total:", getTotalHeroesCount());
}

// ============================================
// MESSAGE DE CONSOLE (OPTIONNEL)
// ============================================
console.log(`
🦸‍♂️ MARVEL RIVALS HERO SELECTOR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⌨️  Raccourcis:
• Espace ou R: Sélection aléatoire
• 1, 2, 3: Filtrer par rôle
• 0: Afficher tous

🔧 Debug: debugHeroes()
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
