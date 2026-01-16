// ===============================
// PROTEÇÃO DO MAPEAMENTO
// ===============================
if (typeof plants !== "undefined") {
  Object.freeze(plants);
} else {
  console.error("Objeto plants não encontrado. Verifique plants-data.js");
}

// ===============================
// FUNÇÕES UTILITÁRIAS
// ===============================
function normalize(text) {
  return text.toLowerCase().trim().replace(/\s+/g, "");
}

function scientificCapitalize(name) {
  if (!name) return "";
  return name
    .toLowerCase()
    .split(" ")
    .map((word, i) =>
      i === 0
        ? word.charAt(0).toUpperCase() + word.slice(1)
        : word
    )
    .join(" ");
}

function highlightMatch(word, query) {
  if (!word.startsWith(query)) {
    return scientificCapitalize(word);
  }

  const start = word.slice(0, query.length);
  const rest = word.slice(query.length);

  return `<strong>${scientificCapitalize(start)}</strong>${rest.toLowerCase()}`;
}

// ===============================
// DISTÂNCIA DE LEVENSHTEIN
// ===============================
function levenshteinDistance(a, b) {
  const matrix = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) =>
      i === 0 ? j : j === 0 ? i : 0
    )
  );

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      matrix[i][j] =
        a[i - 1] === b[j - 1]
          ? matrix[i - 1][j - 1]
          : Math.min(
              matrix[i - 1][j - 1] + 1,
              matrix[i][j - 1] + 1,
              matrix[i - 1][j] + 1
            );
    }
  }

  return matrix[a.length][b.length];
}

// ===============================
// BUSCA APROXIMADA
// ===============================
function fuzzySearch(query) {
  if (typeof plants === "undefined") return null;

  let bestMatch = null;
  let bestScore = Infinity;

  for (const name of Object.keys(plants)) {
    const score = levenshteinDistance(query, name);
    if (score < bestScore) {
      bestScore = score;
      bestMatch = name;
    }
  }

  return bestScore <= 2 ? bestMatch : null;
}

// ===============================
// BUSCA PRINCIPAL
// ===============================
function searchPlant() {
  const input = document.getElementById("search-bar");
  const didYouMeanBox = document.getElementById("did-you-mean");
  const autocompleteList = document.getElementById("autocomplete-list");
    if (autocompleteList) {
    autocompleteList.innerHTML = "";
  }
  if (!input || !didYouMeanBox) return;

  const query = input.value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");

  didYouMeanBox.innerHTML = "";

  if (!query) return;

  // 1️⃣ Busca exata (família)
  if (plants[query]) {
    window.location.href = plants[query];
    return;
  }

  // 2️⃣ Busca aproximada
  const suggestion = fuzzySearch(query);

  if (suggestion) {
    didYouMeanBox.innerHTML = `
      Você quis dizer 
      <span id="vqd">${scientificCapitalize(suggestion)}</span>?
    `;

    didYouMeanBox.querySelector("#vqd").addEventListener("click", () => {
      window.location.href = plants[suggestion];
    });

    return;
  }

  button.addEventListener("click", () => {
  console.log("Filtro clicado:", button.dataset.filter);
});

  // 3️⃣ ENTRADA INESPERADA (NOVO)
  didYouMeanBox.innerHTML = `
    Não foi possível encontrar o que você procura.  
    <br>
    <span id="again">Tente novamente<span>.
  `;
}
// ===============================
// EVENTOS
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("search-bar");
  const searchBtn = document.getElementById("search-btn");
  const autocompleteList = document.getElementById("autocomplete-list");
  const didYouMeanBox = document.getElementById("did-you-mean");

  searchBtn?.addEventListener("click", searchPlant);

  searchInput?.addEventListener("keydown", e => {
    if (e.key === "Enter") searchPlant();
  });


document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    const searchInput = document.getElementById("search-bar");
    const autocompleteList = document.getElementById("autocomplete-list");
    const didYouMeanBox = document.getElementById("did-you-mean");

    autocompleteList.innerHTML = "";
    didYouMeanBox.innerHTML = "";
    searchInput.blur(); // tira o foco da barra
  }
});


  // ===============================
  // AUTOCOMPLETE + HIGHLIGHT
  // ===============================
  searchInput?.addEventListener("input", () => {
    if (typeof plants === "undefined") return;

    const value = normalize(searchInput.value);
    autocompleteList.innerHTML = "";
    didYouMeanBox.innerHTML = "";

    if (!value) return;

    Object.keys(plants)
      .filter(name => name.startsWith(value))
      .slice(0, 8)
      .forEach(match => {
        const li = document.createElement("li");
        li.innerHTML = highlightMatch(match, value);

        li.addEventListener("click", () => {
          searchInput.value = scientificCapitalize(match);
          autocompleteList.innerHTML = "";
          searchPlant();
        });

        autocompleteList.appendChild(li);
      });
  });

// ===============================
// FILTROS DO CATÁLOGO
// ===============================
document.querySelectorAll(".filter-btn").forEach(button => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;

    // Ativa botão visualmente
    document
      .querySelectorAll(".filter-btn")
      .forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");

    // Filtra os cards
    document.querySelectorAll(".card-link").forEach(link => {
      const card = link.querySelector(".plant-card");
      if (!card) return;

      if (filter === "all" || card.classList.contains(filter)) {
        link.style.display = "block";
      } else {
        link.style.display = "none";
      }
    });
  });
});


  // Fecha autocomplete ao clicar fora
  document.addEventListener("click", e => {
    if (
      !e.target.closest("#search-bar") &&
      !e.target.closest("#autocomplete-list")
    ) {
      autocompleteList.innerHTML = "";
    }
  });
});
