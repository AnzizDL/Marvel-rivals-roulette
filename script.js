// ============================================
// BASE DE DONNÉES DES HÉROS MARVEL RIVALS
// ============================================
const heroes = {
    // VANGUARDS (TANKS) - 12 héros
    tank: [
        'Angela',
        'Anziz',
        'Captain America', 
        'Doctor Strange',
        'Emma Frost',
        'Groot',
        'Hulk',
        'Magneto',
        'Peni Parker',
        'La Chose',
        'Thor',
        'Venom'
    ],
    
    // DUELISTS (DPS) - 23 héros  
    dps: [
        'Black Panther',
        'Black Widow',
        'Blade',
        'Hawkeye',
        'Hela',
        'La Torche',
        'Iron Fist',
        'Iron Man',
        'Magik',
        'Mister Fantastic',
        'Moon Knight',
        'Namor',
        'Nayel',
        'Phoenix',
        'Psylocke',
        'Wanda',
        'Spider-Man',
        'Squirrel Girl',
        'Star-Lord',
        'Storm',
        'The Punisher',
        'Winter Soldier',
        'Wolverine'
    ],
    
    // STRATEGISTS (SUPPORT/HEAL) - 9 héros
    healer: [
        'Adam Warlock',
        'Cloak & Dagger',
        'Invisible Woman',
        'Jeff',
        'Loki',
        'Luna Snow',
        'Mantis',
        'Rocket Raccoon',
        'Ultron'
    ]
};

// ============================================
// CONFIGURATION DES RÔLES ET COULEURS
// ============================================
const roleConfig = {
    tank: {
        name: 'TANK',
        color: '#4A90E2'        // Bleu doux
    },
    dps: {
        name: 'DPS', 
        color: '#E74C3C'        // Rouge doux
    },
    healer: {
        name: 'HEALER',
        color: '#2ECC71'        // Vert doux
    }
};

// ============================================
// VARIABLES GLOBALES
// ============================================
let currentFilter = 'all';    // Filtre actuel (all, tank, dps, healer)
let isAnimating = false;       // Empêche les clics multiples pendant l'animation

// ============================================
// ÉLÉMENTS DOM PRINCIPAUX
// ============================================
const roleButtons = document.querySelectorAll('.role-btn');
const randomButton = document.getElementById('randomBtn');
const heroCard = document.getElementById('heroCard');
const heroName = document.getElementById('heroName');
const heroRoleBadge = document.getElementById('heroRoleBadge');
const heroAnimation = document.getElementById('heroAnimation');
const heroesGrid = document.getElementById('heroesGrid');
const resultSection = document.getElementById('resultSection');

// ============================================
// INITIALISATION DE L'APPLICATION
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    generateHeroesGrid();
    updateStats();
});

function initializeApp() {
    console.log('🚀 Marvel Rivals Hero Selector initialisé');
    console.log(`📊 Total des héros: ${getTotalHeroesCount()}`);
    
    // Animation d'entrée pour le titre (optionnel)
    setTimeout(() => {
        document.querySelector('.main-title').style.animation = 'titleGlow 2s ease-in-out infinite alternate';
    }, 500);
}

// ============================================
// GESTION DES ÉVÉNEMENTS
// ============================================
function setupEventListeners() {
    // Boutons de filtres de rôles
    roleButtons.forEach(btn => {
        btn.addEventListener('click', () => handleRoleFilter(btn));
    });
    
    // Bouton de sélection aléatoire
    randomButton.addEventListener('click', selectRandomHero);
    
    // Raccourcis clavier
    document.addEventListener('keydown', handleKeyboard);
}

// Gestion des raccourcis clavier
function handleKeyboard(e) {
    if (e.code === 'Space') {
        e.preventDefault();
        selectRandomHero();
    }
    
    switch(e.key) {
        case '1': document.querySelector('[data-role="tank"]').click(); break;
        case '2': document.querySelector('[data-role="dps"]').click(); break;
        case '3': document.querySelector('[data-role="healer"]').click(); break;
        case '0': document.querySelector('[data-role="all"]').click(); break;
        case 'r':
        case 'R': selectRandomHero(); break;
    }
}

// ============================================
// GESTION DES FILTRES PAR RÔLE
// ============================================
function handleRoleFilter(clickedBtn) {
    if (isAnimating) return;
    
    const role = clickedBtn.dataset.role;
    
    // Mise à jour du bouton actif
    roleButtons.forEach(btn => btn.classList.remove('active'));
    clickedBtn.classList.add('active');
    
    currentFilter = role;
    
    // Animation de transition douce
    heroesGrid.style.opacity = '0.5';
    setTimeout(() => {
        generateHeroesGrid();
        heroesGrid.style.opacity = '1';
    }, 200);
    
    // Feedback visuel simple
    clickedBtn.style.transform = 'scale(0.95)';
    setTimeout(() => {
        clickedBtn.style.transform = '';
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
    const availableHeroes = getFilteredHeroes();
    
    if (availableHeroes.length === 0) {
        console.warn('Aucun héros disponible pour le filtre sélectionné');
        isAnimating = false;
        return;
    }
    
    // Démarrer l'animation de roulette avec suspense
    startSuspenseAnimation(availableHeroes);
}

// Animation de suspense avec roulette
function startSuspenseAnimation(availableHeroes) {
    const heroName = document.getElementById('heroName');
    const heroCard = document.getElementById('heroCard');
    const heroRoleBadge = document.getElementById('heroRoleBadge');
    
    // Préparer la carte pour l'animation
    heroCard.classList.add('suspense-active');
    heroRoleBadge.style.opacity = '0';
    
    let animationStep = 0;
    const totalSteps = 10; // Réduit de 15 à 10 changements
    const baseDelay = 60; // Réduit de 80 à 60ms
    
    function showRandomPreview() {
        if (animationStep < totalSteps) {
            // Choisir un héros aléatoire pour l'aperçu
            const previewIndex = Math.floor(Math.random() * availableHeroes.length);
            const previewHero = availableHeroes[previewIndex];
            const previewRole = getHeroRole(previewHero.name);
            
            // Mettre à jour l'affichage temporaire
            heroName.textContent = previewHero.name;
            heroName.classList.add('suspense-flash');
            heroCard.style.borderColor = roleConfig[previewRole].color;
            
            // Supprimer l'effet flash
            setTimeout(() => {
                heroName.classList.remove('suspense-flash');
            }, 30);
            
            animationStep++;
            
            // Délai qui augmente progressivement pour créer le suspense
            const delay = baseDelay + (animationStep * 40); // Réduit de 60 à 40ms
            setTimeout(showRandomPreview, delay);
            
        } else {
            // Animation terminée, choisir le vrai héros final
            setTimeout(() => {
                revealFinalHero(availableHeroes);
            }, 400); // Réduit de 800 à 400ms
        }
    }
    
    // Démarrer l'animation de suspense
    showRandomPreview();
}

// Révélation finale dramatique
function revealFinalHero(availableHeroes) {
    const heroName = document.getElementById('heroName');
    const heroCard = document.getElementById('heroCard');
    
    // Pause dramatique
    heroName.textContent = '...';
    heroCard.classList.add('final-suspense');
    
    setTimeout(() => {
        // Sélectionner le héros final
        const finalIndex = Math.floor(Math.random() * availableHeroes.length);
        const selectedHero = availableHeroes[finalIndex];
        
        // Nettoyer les classes d'animation
        heroCard.classList.remove('suspense-active', 'final-suspense');
        heroCard.classList.add('final-reveal');
        
        // Afficher le résultat final
        displaySelectedHero(selectedHero);
        
        // Nettoyer après l'animation
        setTimeout(() => {
            heroCard.classList.remove('final-reveal');
        }, 600);
        
    }, 300); // Réduit de 600 à 300ms
}

// Animation simple du bouton
function animateRandomButton() {
    const btnText = randomButton.querySelector('.btn-text');
    
    // Changement de texte temporaire
    btnText.textContent = 'SÉLECTION...';
    randomButton.style.pointerEvents = 'none';
    
    // Retour à la normale
    setTimeout(() => {
        btnText.textContent = 'SÉLECTIONNER UN HÉROS';
        randomButton.style.pointerEvents = 'auto';
        isAnimating = false;
    }, 1200);
}

// ============================================
// AFFICHAGE DU HÉROS SÉLECTIONNÉ
// ============================================
function displaySelectedHero(selectedHero) {
    // Déterminer le rôle du héros
    const heroRole = getHeroRole(selectedHero.name);
    
    // Réinitialiser les classes
    heroCard.className = 'hero-card';
    heroName.className = 'hero-name';
    heroRoleBadge.className = 'hero-role-badge';
    
    // Animation d'entrée simple
    setTimeout(() => {
        heroCard.classList.add('active');
        
        // Mise à jour du contenu
        heroName.textContent = selectedHero.name;
        
        // Badge de rôle
        heroRoleBadge.textContent = roleConfig[heroRole].name;
        heroRoleBadge.classList.add('show', heroRole);
        
        // Couleur de la carte selon le rôle
        heroCard.style.borderColor = roleConfig[heroRole].color;
        
    }, 100);
    
    // Mise en évidence dans la grille
    highlightHeroInGrid(selectedHero.name);
}

// ============================================
// MISE EN ÉVIDENCE DANS LA GRILLE
// ============================================
function highlightHeroInGrid(heroName) {
    const gridCards = document.querySelectorAll('.hero-grid-card');
    
    // Réinitialiser tous les highlights
    gridCards.forEach(card => {
        card.classList.remove('highlighted');
        card.style.transform = '';
        card.style.boxShadow = '';
    });
    
    // Trouver et mettre en évidence le héros sélectionné
    gridCards.forEach(card => {
        if (card.querySelector('.hero-grid-name').textContent === heroName) {
            card.style.transform = 'scale(1.05)';
            card.style.border = '3px solid #AEB6BF';
            
            // Retour à la normale après 2 secondes
            setTimeout(() => {
                card.style.transform = '';
                card.style.border = '';
            }, 2000);
        }
    });
}

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

// Obtenir la liste filtrée des héros
function getFilteredHeroes() {
    if (currentFilter === 'all') {
        return getAllHeroes();
    }
    return heroes[currentFilter]?.map(name => ({ name, role: currentFilter })) || [];
}

// Obtenir tous les héros
function getAllHeroes() {
    const allHeroes = [];
    Object.keys(heroes).forEach(role => {
        heroes[role].forEach(name => {
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
    return 'dps'; // Valeur par défaut
}

// Compter le total des héros
function getTotalHeroesCount() {
    return Object.values(heroes).reduce((total, roleHeroes) => total + roleHeroes.length, 0);
}

// ============================================
// GÉNÉRATION DE LA GRILLE DES HÉROS
// ============================================
function generateHeroesGrid() {
    const filteredHeroes = getFilteredHeroes();
    heroesGrid.innerHTML = '';
    
    filteredHeroes.forEach(hero => {
        const card = createHeroGridCard(hero);
        heroesGrid.appendChild(card);
    });
    
    // Animation d'apparition simple
    const cards = heroesGrid.querySelectorAll('.hero-grid-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(10px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.3s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 30);
    });
}

// Créer une carte de héros pour la grille
function createHeroGridCard(hero) {
    const card = document.createElement('div');
    card.className = `hero-grid-card ${hero.role}`;
    
    card.innerHTML = `
        <div class="hero-grid-name">${hero.name}</div>
        <div class="hero-grid-role ${hero.role}">${roleConfig[hero.role].name}</div>
    `;
    
    // Clic pour sélectionner directement
    card.addEventListener('click', () => {
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
    const tankCount = document.getElementById('tankCount');
    const dpsCount = document.getElementById('dpsCount');
    const healerCount = document.getElementById('healerCount');
    
    // Mise à jour simple des compteurs
    tankCount.textContent = heroes.tank.length;
    dpsCount.textContent = heroes.dps.length;
    healerCount.textContent = heroes.healer.length;
    
    // Debug pour vérifier les compteurs
    console.log('Stats mises à jour:', {
        tanks: heroes.tank.length,
        dps: heroes.dps.length,
        healers: heroes.healer.length
    });
}

// ============================================
// FONCTIONS DE DEBUG (OPTIONNELLES)
// ============================================
function debugHeroes() {
    console.log('🦸‍♂️ Debug des héros:');
    console.log('Tanks:', heroes.tank.length, heroes.tank);
    console.log('DPS:', heroes.dps.length, heroes.dps);
    console.log('Healers:', heroes.healer.length, heroes.healer);
    console.log('Total:', getTotalHeroesCount());
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