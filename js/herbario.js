let familias = null;

// ===============================
// CARREGAR JSON
// ===============================
async function carregarFamilias() {
  try {
    const resposta = await fetch("data/familias.json");
    if (!resposta.ok) throw new Error("Erro ao carregar familias.json");

    familias = await resposta.json();
    Object.freeze(familias);

    console.log("Famílias carregadas:", familias);
  } catch (erro) {
    console.error("Erro:", erro);
  }
}
async function carregarCards() {
  try {
    const res = await fetch("data/cards.html");
    if (!res.ok) throw new Error("Erro ao carregar cards");

    const html = await res.text();
    document.getElementById("cards-container").innerHTML = html;
  } catch (e) {
    console.error("Erro ao carregar cards:", e);
  }
}



document.addEventListener("DOMContentLoaded", () => {
  carregarCards();
});

// ===============================
// UTILITÁRIOS
// ===============================
function normalize(text) {
  return text.toLowerCase().trim().replace(/\s+/g, "");
}

function scientificCapitalize(name) {
  return name
    .toLowerCase()
    .split(" ")
    .map((w, i) => (i === 0 ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

// ===============================
// LEVENSHTEIN
// ===============================
function levenshteinDistance(a, b) {
  const m = Array.from({ length: a.length + 1 }, () =>
    Array(b.length + 1).fill(0)
  );

  for (let i = 0; i <= a.length; i++) m[i][0] = i;
  for (let j = 0; j <= b.length; j++) m[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      m[i][j] =
        a[i - 1] === b[j - 1]
          ? m[i - 1][j - 1]
          : Math.min(
              m[i - 1][j - 1] + 1,
              m[i][j - 1] + 1,
              m[i - 1][j] + 1
            );
    }
  }
  return m[a.length][b.length];
}

// ===============================
// BUSCA APROXIMADA
// ===============================
function fuzzySearch(query) {
  let best = null;
  let score = Infinity;

  for (const key in familias) {
    const d = levenshteinDistance(query, key);
    if (d < score) {
      score = d;
      best = key;
    }
  }

  return score <= 2 ? best : null;
}

// ===============================
// BUSCA PRINCIPAL
// ===============================
function searchPlant() {
  const input = document.getElementById("search-bar");
  const didYouMean = document.getElementById("did-you-mean");
  didYouMean.innerHTML = "";
  const autocomplete = document.getElementById("autocomplete-list");
  autocomplete.innerHTML = "";
  didYouMean.innerHTML = "";
  const query = normalize(input.value);
  if (!query) return;
  // Busca exata
 if (familias[query] && familias[query].page) {
  window.location.href = familias[query].page;
  return;
}
if (!familias) {
  console.warn("Famílias ainda não carregadas");
  return;
}
  // Busca aproximada
  const sugestao = fuzzySearch(query);
  if (sugestao) {
    didYouMean.innerHTML = `
      Você quis dizer
      <span id="vqd">${familias[sugestao].name}</span>?
    `;

    document.getElementById("vqd").onclick = () => {
      window.location.href = familias[sugestao].page;
    };
    return;
  }

  // Não encontrado
  didYouMean.innerHTML = `
    Não foi possível encontrar o que você procura.<br>
    <span id="again">Tente novamente.</span>
  `;
}

// ===============================
// EVENTOS
// ===============================
document.addEventListener("DOMContentLoaded", async () => {
  await carregarFamilias();

  const searchInput = document.getElementById("search-bar");
  const searchBtn = document.getElementById("search-btn");
  const autocomplete = document.getElementById("autocomplete-list");

  searchBtn?.addEventListener("click", searchPlant);

  searchInput?.addEventListener("keydown", e => {
    if (e.key === "Enter") searchPlant();
    if (e.key === "Escape") {
      autocomplete.innerHTML = "";
      document.getElementById("did-you-mean").innerHTML = "";
      searchInput.blur();
    }
  });
document.addEventListener("click", (event) => {
  const searchInput = document.getElementById("search-bar");
  const autocomplete = document.getElementById("autocomplete-list");

  if (!searchInput || !autocomplete) return;

  // Se clicou fora do input E fora da lista
  if (
    !searchInput.contains(event.target) &&
    !autocomplete.contains(event.target)
  ) {
    autocomplete.innerHTML = "";
  }
});
  // AUTOCOMPLETE
  searchInput?.addEventListener("input", () => {
    const value = normalize(searchInput.value);
    autocomplete.innerHTML = "";
    if (!value) return;

    Object.keys(familias)
      .filter(k => k.startsWith(value))
      .slice(0, 8)
      .forEach(k => {
      const li = document.createElement("li");
      li.textContent = familias[k].name;
      li.onclick = () => {
        searchInput.value = k; // usa a chave real
        searchPlant();
      };
        autocomplete.appendChild(li);
      });
  });

  // FILTROS
  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.onclick = () => {
      const filter = btn.dataset.filter;

      document
        .querySelectorAll(".filter-btn")
        .forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      document.querySelectorAll(".card-link").forEach(link => {
        const card = link.querySelector(".plant-card");
        if (!card) return;

        link.style.display =
          filter === "all" || card.classList.contains(filter)
            ? "block"
            : "none";
      });
    };
  });
});
