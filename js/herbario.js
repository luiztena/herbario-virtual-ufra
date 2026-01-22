let familias = null;
let generos = null;
let bancoBusca = [];

// ===============================
// CARREGAR DADOS
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

async function carregarGeneros() {
  try {
    const resposta = await fetch("data/generos.json");
    if (!resposta.ok) throw new Error("Erro ao carregar generos.json");
    
    generos = await resposta.json();
    Object.freeze(generos);
    console.log("Gêneros carregados:", generos);
  } catch (erro) {
    console.error("Erro:", erro);
  }
}

async function carregarCards() {
  try {
    const res = await fetch("data/cards.html");
    if (!res.ok) throw new Error("Erro ao carregar cards");
    
    const html = await res.text();
    const container = document.getElementById("cards-container");
    if (container) {
      container.innerHTML = html;
      // Aplicar filtros após carregar os cards
      aplicarFiltros();
    }
  } catch (e) {
    console.error("Erro ao carregar cards:", e);
  }
}

// ===============================
// MONTAR BANCO DE BUSCA
// ===============================
function montarBancoBusca() {
  bancoBusca = [];

  // Famílias
  if (familias) {
    Object.values(familias).forEach(f => {
      bancoBusca.push({
        id: f.id,
        name: f.name,
        key: normalize(f.id),
        tipo: "Família",
        page: f.page
      });
    });
  }

  // Gêneros
  if (generos) {
    Object.values(generos).forEach(g => {
      bancoBusca.push({
        id: g.id,
        name: g.name,
        key: normalize(g.id),
        tipo: "Gênero",
        page: `../html/genero.html?id=${g.id}`
      });
    });
  }

  console.log("Banco de busca pronto com", bancoBusca.length, "itens");
}

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

  bancoBusca.forEach(item => {
    const d = levenshteinDistance(query, item.key);
    if (d < score) {
      score = d;
      best = item;
    }
  });

  return score <= 2 ? best : null;
}

// ===============================
// BUSCA PRINCIPAL
// ===============================
function searchPlant() {
  const input = document.getElementById("search-bar");
  const didYouMean = document.getElementById("did-you-mean");
  const autocomplete = document.getElementById("autocomplete-list");

  if (!input || !didYouMean || !autocomplete) return;

  didYouMean.innerHTML = "";
  autocomplete.innerHTML = "";

  const query = normalize(input.value);
  if (!query) return;

  // 🔹 Busca exata (família ou gênero)
  const exato = bancoBusca.find(item => item.key === query);

  if (exato) {
    window.location.href = exato.page;
    return;
  }

  // 🔹 Busca aproximada (Levenshtein)
  const melhor = fuzzySearch(query);

  if (melhor) {
    // Determinar cor da badge
    const badgeColor = melhor.tipo === 'Família' ? '#416939' : '#52796f';
    const badgeStyle = `
      background-color: ${badgeColor};
      color: white;
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-left: 10px;
    `;
    
    didYouMean.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
        <span>Você quis dizer</span>
        <div style="display: flex; align-items: center; gap: 6px; background: #f5f7f2; padding: 8px 12px; border-radius: 8px; border: 1px solid #ddd;">
          <span id="vqd" class="suggestion-text">
            ${melhor.name}
          </span>
          <span style="${badgeStyle}">${melhor.tipo}</span>
        </div>
        <span>?</span>
      </div>
      <div style="text-align: center; margin-top: 10px; font-size: 0.9rem; color: #666;">
        Clique no nome para acessar
      </div>
    `;

    document.getElementById("vqd").onclick = () => {
      window.location.href = melhor.page;
    };
    
    // Adicionar efeito hover
    const vqdElement = document.getElementById("vqd");
    vqdElement.style.cursor = "pointer";
    vqdElement.style.color = "#416939";
    vqdElement.style.fontWeight = "600";
    vqdElement.style.transition = "color 0.2s ease";
    
    vqdElement.addEventListener("mouseover", () => {
      vqdElement.style.color = "#283618";
      vqdElement.style.textDecoration = "underline";
    });
    
    vqdElement.addEventListener("mouseout", () => {
      vqdElement.style.color = "#416939";
      vqdElement.style.textDecoration = "none";
    });
    
    return;
  }

  // 🔹 Não encontrado
  didYouMean.innerHTML = `
    <div style="text-align: center; padding: 15px;">
      <div style="color: #666; margin-bottom: 10px;">
        Não foi possível encontrar o que você procura.
      </div>
      <span id="again" style="
        cursor: pointer;
        color: #416939;
        font-weight: 600;
        text-decoration: underline;
        padding: 8px 16px;
        border: 1px solid #416939;
        border-radius: 20px;
        display: inline-block;
        transition: all 0.3s ease;
      ">
        Tentar novamente
      </span>
    </div>
  `;

  document.getElementById("again").onclick = () => {
    input.value = "";
    input.focus();
    didYouMean.innerHTML = "";
  };
  
  // Efeito hover no botão "Tentar novamente"
  const againElement = document.getElementById("again");
  againElement.addEventListener("mouseover", () => {
    againElement.style.backgroundColor = "#416939";
    againElement.style.color = "white";
  });
  
  againElement.addEventListener("mouseout", () => {
    againElement.style.backgroundColor = "transparent";
    againElement.style.color = "#416939";
  });
}

// ===============================
// AUTCOMPLETE
// ===============================
function atualizarAutocomplete() {
  const searchInput = document.getElementById("search-bar");
  const autocomplete = document.getElementById("autocomplete-list");
  
  if (!searchInput || !autocomplete) return;
  
  const value = normalize(searchInput.value);
  autocomplete.innerHTML = "";
  
  if (!value) return;

  const resultados = bancoBusca
    .filter(item => item.key.includes(value))
    .slice(0, 8);

  if (resultados.length === 0) return;

  resultados.forEach(item => {
    const li = document.createElement("li");
    
    // Determinar cor da badge baseada no tipo
    const badgeColor = item.tipo === 'Família' ? '#416939' : '#52796f';
    
    li.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
        <span style="font-weight: 500; color: #333;">${item.name}</span>
        <span style="
          background-color: ${badgeColor};
          color: white;
          padding: 3px 10px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          min-width: 70px;
          text-align: center;
        ">${item.tipo}</span>
      </div>
    `;
    
    li.style.cursor = "pointer";
    li.style.padding = "10px 12px";
    li.style.borderBottom = "1px solid #e0e0e0";
    li.style.transition = "all 0.2s ease";
    
    li.addEventListener("mouseover", () => {
      li.style.backgroundColor = "#f5f7f2";
      li.style.transform = "translateX(5px)";
    });
    
    li.addEventListener("mouseout", () => {
      li.style.backgroundColor = "";
      li.style.transform = "";
    });
    
    li.onclick = () => {
      window.location.href = item.page;
    };
    
    autocomplete.appendChild(li);
  });
}

// ===============================
// FILTROS
// ===============================
function aplicarFiltros() {
  const botoesFiltro = document.querySelectorAll(".filter-btn");
  
  botoesFiltro.forEach(btn => {
    btn.addEventListener("click", () => {
      const filter = btn.dataset.filter;
      
      // Ativar botão clicado
      botoesFiltro.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      
      // Aplicar filtro aos cards
      const cards = document.querySelectorAll(".card-link");
      cards.forEach(link => {
        const card = link.querySelector(".plant-card");
        if (!card) return;
        
        if (filter === "all") {
          link.style.display = "block";
        } else {
          link.style.display = card.classList.contains(filter) ? "block" : "none";
        }
      });
    });
  });
}

// ===============================
// CAPTURAR ERROS GLOBAIS
// ===============================
window.addEventListener('unhandledrejection', (event) => {
  console.warn('Promise não tratada:', event.reason);
  // Previne o erro de aparecer no console
  event.preventDefault();
});

window.addEventListener('error', (event) => {
  console.warn('Erro global:', event.error);
  return true;
});

// ===============================
// EVENTOS (VERSÃO CORRIGIDA)
// ===============================
document.addEventListener("DOMContentLoaded", async () => {
  console.log("DOM carregado, inicializando...");
  
  try {
    // Carregar dados
    await Promise.all([
      carregarFamilias(),
      carregarGeneros()
    ]);
    
    montarBancoBusca();
    
    // Carregar cards
    await carregarCards();
    
    // Configurar eventos de forma segura
    configurarEventos();
    
  } catch (erro) {
    console.error("Erro na inicialização:", erro);
  }
});

// Função separada para configurar eventos
function configurarEventos() {
  const searchInput = document.getElementById("search-bar");
  const searchBtn = document.getElementById("search-btn");
  
  // Botão de busca - tratamento correto
  if (searchBtn) {
    searchBtn.addEventListener("click", (event) => {
      event.preventDefault();
      searchPlant();
    });
  }
  
  // Eventos do input de busca - tratamento correto
  if (searchInput) {
    // Enter para buscar
    searchInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        searchPlant();
      }
      
      if (event.key === "Escape") {
        const autocomplete = document.getElementById("autocomplete-list");
        const didYouMean = document.getElementById("did-you-mean");
        if (autocomplete) autocomplete.innerHTML = "";
        if (didYouMean) didYouMean.innerHTML = "";
        searchInput.blur();
      }
    });
    
    // Input para autocomplete - com debounce
    let timeoutId;
    searchInput.addEventListener("input", () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        atualizarAutocomplete();
      }, 150);
    });
    
    // Foco para mostrar sugestões
    searchInput.addEventListener("focus", () => {
      if (searchInput.value.trim()) {
        atualizarAutocomplete();
      }
    });
  }
  
  // Fechar autocomplete ao clicar fora - versão segura
  document.addEventListener("click", (event) => {
    const searchInput = document.getElementById("search-bar");
    const autocomplete = document.getElementById("autocomplete-list");
    
    if (!searchInput || !autocomplete) return;
    
    if (!searchInput.contains(event.target) && !autocomplete.contains(event.target)) {
      autocomplete.innerHTML = "";
    }
  }, true); // Use capture phase para garantir execução
}

// Remova esta linha problemática:
// window.addEventListener("load", () => {
//   console.log("Página carregada");
// });