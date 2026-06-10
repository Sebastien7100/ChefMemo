const recipeForm = document.getElementById('recipe-form');
const recipesContainer = document.getElementById('recipes-container');
const searchBar = document.getElementById('search-bar');
const filterCategory = document.getElementById('filter-category');

const mainPage = document.getElementById('main-page');
const detailsPage = document.getElementById('details-page');
const backBtn = document.getElementById('back-btn');

let recipes = JSON.parse(localStorage.getItem('recipes')) || [];

document.addEventListener('DOMContentLoaded', () => {
    displayRecipes(recipes);
    updateCategoriesDropdown();
});

// 1. TRAITEMENT ET TRI DU TEXTE COLLÉ
recipeForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const rawText = document.getElementById('raw-text').value;
    const lowerText = rawText.toLowerCase();
    
    let ingredientsText = rawText;
    let stepsText = "Aucune étape détectée. Modifiez la recette si nécessaire.";

    // Détection automatique des séparateurs de recettes
    let separatorIndex = -1;
    const keywords = ["recette:", "recette", "préparation:", "préparation", "preparation", "étapes", "etapes", "instructions"];

    for (let keyword of keywords) {
        if (lowerText.includes(keyword)) {
            separatorIndex = lowerText.indexOf(keyword);
            // On extrait les ingrédients (avant le mot clé) et les étapes (après le mot clé + la longueur du mot)
            ingredientsText = rawText.substring(0, separatorIndex);
            stepsText = rawText.substring(separatorIndex);
            break;
        }
    }

    const newRecipe = {
        id: Date.now(),
        title: document.getElementById('title').value,
        category: document.getElementById('category').value,
        ingredients: ingredientsText.trim(),
        steps: stepsText.trim()
    };

    recipes.push(newRecipe);
    saveAndRefresh();
    recipeForm.reset();
});

// 2. AFFICHAGE DE LA LISTE
function displayRecipes(recipesToDisplay) {
    recipesContainer.innerHTML = '';

    if (recipesToDisplay.length === 0) {
        recipesContainer.innerHTML = '<p>Aucune recette trouvée.</p>';
        return;
    }

    recipesToDisplay.forEach(recipe => {
        const card = document.createElement('div');
        card.classList.add('recipe-card');
        card.setAttribute('onclick', `openRecipeDetails(${recipe.id})`);

        card.innerHTML = `
            <span class="recipe-category">${recipe.category}</span>
            <h3>${recipe.title}</h3>
            <button class="card-delete-btn" onclick="deleteRecipe(event, ${recipe.id})">Supprimer</button>
        `;
        recipesContainer.appendChild(card);
    });
}

// 3. OUVERTURE DES DÉTAILS
window.openRecipeDetails = function(id) {
    const recipe = recipes.find(r => r.id === id);
    if (!recipe) return;

    document.getElementById('detail-title').textContent = recipe.title;
    document.getElementById('detail-category').textContent = recipe.category;
    document.getElementById('detail-ingredients').textContent = recipe.ingredients;
    document.getElementById('detail-steps').textContent = recipe.steps;

    mainPage.style.display = 'none';
    detailsPage.style.display = 'block';
};

backBtn.addEventListener('click', () => {
    detailsPage.style.display = 'none';
    mainPage.style.display = 'block';
});

function saveAndRefresh() {
    localStorage.setItem('recipes', JSON.stringify(recipes));
    displayRecipes(recipes);
    updateCategoriesDropdown();
}

window.deleteRecipe = function(event, id) {
    event.stopPropagation();
    recipes = recipes.filter(recipe => recipe.id !== id);
    saveAndRefresh();
};

function updateCategoriesDropdown() {
    const categories = ['all', ...new Set(recipes.map(r => r.category))];
    filterCategory.innerHTML = '';
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat === 'all' ? 'Toutes les catégories' : cat;
        filterCategory.appendChild(option);
    });
}

filterCategory.addEventListener('change', () => {
    const selected = filterCategory.value;
    const filtered = selected === 'all' ? recipes : recipes.filter(r => r.category === selected);
    displayRecipes(filtered);
});

searchBar.addEventListener('input', () => {
    const text = searchBar.value.toLowerCase();
    const filtered = recipes.filter(r => r.title.toLowerCase().includes(text));
    displayRecipes(filtered);
});